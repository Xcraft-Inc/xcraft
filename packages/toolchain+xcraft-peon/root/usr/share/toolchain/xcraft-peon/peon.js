'use strict';

const moduleName = 'peon';

var path = require ('path');
var fs   = require ('fs');

var xFs       = require ('xcraft-core-fs');
var xPeon     = require ('xcraft-contrib-peon');
var xPh       = require ('xcraft-core-placeholder');
var xPlatform = require ('xcraft-core-platform');


function isPackageSrc (pkg) {
  return /-src$/.test (pkg.name);
}

function explodeName (name) {
  return {
    prefix: name.replace (/\+.*/, ''),
    name:   name.replace (/.*\+/, '').replace (/-src$/, '')
  };
}

function getBasePath (root, pkg) {
  const isSrc   = isPackageSrc (pkg);
  const expName = explodeName (pkg.name);

  let base = './';
  if (isSrc) {
    base = `usr/src/${expName.prefix}+${expName.name}_${pkg.version}`;
  }

  return path.join (root, base);
}

class Action {
  constructor (pkg, root, currentDir, binaryDir, resp) {
    this._pkg    = pkg;
    this._share  = currentDir;
    this._root   = root;
    this._resp   = resp;

    try {
      this._config = JSON.parse (fs.readFileSync (path.join (this._share, './config.json')));
    } catch (ex) {
      if (ex.code !== 'ENOENT') {
        throw ex;
      }
      this._resp.log.warn (`no config file, ensure that it's a postrm action`);
      this._config = null;
    }

    /* This condition is true only when wpkg is building a new binary package
     * from a source package.
     */
    if (binaryDir) {
      this._genBinWpkg (binaryDir);
    }
  }

  _genConfig (prefixDir, config) {
    var newConfig = {
      get: {},
      type: 'bin',
      configure: config.configure,
      rules: {
        type: 'configure',
        location: '',
        args: {}
      },
      embedded: true
    };

    var data     = JSON.stringify (newConfig, null, '  ');
    var fullName = this._share.match (/.[\/\\]([^\/\\]+)[\/\\]([^\/\\]+)[\/\\]?$/);

    var shareDir = path.join (prefixDir, 'share', fullName[1], fullName[2]);
    xFs.mkdir (shareDir);

    fs.writeFileSync (path.join (shareDir, 'config.json'), data);
  }

  _getExtra () {
    return {
      location:  this._config.rules.location,
      configure: this._config.configure,
      embedded:  this._config.embedded
    };
  }

  _genBinWpkg (binaryDir) {
    /* HACK: forced subpackage /runtime
     * we need to rework packageDef model before
     */
    var installDir = path.normalize (binaryDir.replace (/build$/, 'install/runtime'));
    var prefixDir = path.join (installDir, 'usr');
    xPh.global
      .set ('PREFIXDIR',  prefixDir)
      .set ('INSTALLDIR', installDir);

    /* Copy postinst and prerm scripts for the binary package. */
    var installWpkgDir = path.join (installDir, 'WPKG');
    xFs.mkdir (installWpkgDir);
    ['postinst', 'prerm'].forEach ((script) => {
      script = script + xPlatform.getShellExt ();
      xFs.cp (path.join (this._root, script), path.join (installWpkgDir, script));
    });

    /* Generate the config.json file. */
    this._genConfig (prefixDir, this._config.runtime);

    /* Copy etc/ files if available. */
    try {
      xFs.cp (path.join (this._root, 'etc'), path.join (installDir, 'etc'));
    } catch (ex) {
      this._resp.log.warn ('the etc/ directory is not available');
    }
  }

  _internalConfigure (fileList) {
    fileList.forEach (_file => {
      const file = path.join (this._root, _file);

      if (!fs.existsSync (file) || fs.statSync (file).isDirectory ()) {
        return;
      }

      const regex = /(?:[a-zA-Z]:|\\\\)?[\\/][^"']+[\\/]wpkg-[0-9]+[\\/]install[\\/]runtime/g;

      if (xFs.sed (file, regex, this._root)) {
        this._resp.log.warn (`target root fixed for ${file}`);
      }
    });
  }

  _patchApply (extra, callback) {
    var xDevel = require ('xcraft-core-devel');

    var patchesDir = path.join (this._share, 'patches');
    var srcDir     = path.join (this._share, 'cache', extra.location);

    xDevel.autoPatch (patchesDir, srcDir, this._resp, callback);
  }

  _peonRun (extra) {
    this._resp.log.verb ('Command: %s %s', extra.location, JSON.stringify (extra.args));

    const peonAction = xPeon[this._config.type][this._config.rules.type];
    peonAction (this._config.get, this._root, this._share, extra, this._resp, (err) => {
      if (err) {
        this._resp.log.err (err);
        this._resp.log.err ('Can not %s %s', this._config.rules.type, this._config.type);
        process.exit (1);
      }
    });
  }

  postinst () {
    const extra = this._getExtra ();
    extra.args = {
      all: this._config.rules.args.postinst
    };

    if (this._config.rules.type === 'configure') {
      extra.forceConfigure = true;
    }

    this._patchApply (extra, () => {
      if (!extra.forceConfigure) {
        this._peonRun (extra);
        return;
      }

      const tar  = require ('tar-fs');
      const tarFile = path.join (this._root, 'var/lib/wpkg', this._pkg.name, 'data.tar');
      const list = [];

      fs.createReadStream (tarFile)
        .pipe (tar.extract ('', {
          ignore: entry => {
            list.push (entry);
            return true;
          }
        }))
        .on ('finish', err => {
          if (err) {
            this._resp.log.err (err);
            process.exit (1);
          }

          this._internalConfigure (list);
          this._peonRun (extra);
        });
    });
  }

  prerm () {
    const extra = this._getExtra ();
    extra.args = {
      all: this._config.rules.args.prerm
    };
    this._peonRun (extra);
  }

  postrm (wpkgAct) {
    if (!isPackageSrc (this._pkg)) {
      return;
    }

    if (wpkgAct === 'remove') {
      xFs.rm (getBasePath (this._root, this._pkg));
    }
  }

  makeall () {
    const extra = this._getExtra ();
    extra.args = {
      all:     this._config.rules.args.makeall,
      install: this._config.rules.args.makeinstall
    };
    extra.deploy = this._config.deploy;

    this._patchApply (extra, () => {
      this._peonRun (extra);
    });
  }
}

function guessSharePath (root, share, pkg) {
  if (share && share.length) {
    return path.join (root, share);
  }

  const base    = getBasePath (root, pkg);
  const expName = explodeName (pkg.name);

  return path.join (base, `usr/share/${expName.prefix}/${expName.name}`);
}

if (process.argv.length >= 4) {
  const root    = process.argv[2];
  const action  = process.argv[4];
  const wpkgAct = process.argv[5];
  const prefix  = process.argv[6];
  const pkg = {
    name:    process.argv[7],
    version: process.argv[8]
  };

  const share = guessSharePath (root, process.argv[3], pkg);

  const xBusClient = require ('xcraft-core-busclient');
  const resp = xBusClient.newResponse (moduleName);

  require ('xcraft-core-log') (moduleName, resp);

  const main = new Action (pkg, root, share, prefix, resp);

  resp.log.verb ('run the action: ' + action);
  main[action] (wpkgAct);
}
