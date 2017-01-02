'use strict';

const moduleName = 'peon';

const path = require ('path');
const fs   = require ('fs');
const watt = require ('watt');

const xFs       = require ('xcraft-core-fs');
const xPeon     = require ('xcraft-contrib-peon');
const xPh       = require ('xcraft-core-placeholder');
const xPlatform = require ('xcraft-core-platform');


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
  constructor (pkg, root, currentDir, binaryDir, hook, resp) {
    this._pkg    = pkg;
    this._share  = currentDir;
    this._root   = root;
    this._global = hook === 'global'; /* local otherwise */
    this._resp   = resp;
    this._prefix = null;

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

    watt.wrapAll (this);
  }

  _genConfig (prefixDir, config) {
    const newConfig = {
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

    const data     = JSON.stringify (newConfig, null, '  ');
    const fullName = this._share.match (/.[\/\\]([^\/\\]+)[\/\\]([^\/\\]+)[\/\\]?$/);

    const shareDir = path.join (prefixDir, 'share', fullName[1], fullName[2]);
    xFs.mkdir (shareDir);

    fs.writeFileSync (path.join (shareDir, 'config.json'), data);
  }

  _getExtra () {
    return {
      location:       this._config.rules.location,
      configure:      this._config.configure,
      embedded:       this._config.embedded,
      forceConfigure: this._config.rules.type === 'configure'
    };
  }

  _genBinWpkg (binaryDir) {
    /* HACK: forced subpackage /runtime
     * we need to rework packageDef model before
     */
    const installDir = path.normalize (binaryDir.replace (/build$/, 'install/runtime'));
    const prefixDir = path.join (installDir, 'usr');
    xPh.global
      .set ('PREFIXDIR',  prefixDir)
      .set ('INSTALLDIR', installDir);

    this._prefix = prefixDir;

    /* Copy postinst and prerm scripts for the binary package. */
    const installWpkgDir = path.join (installDir, 'WPKG');
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

      const regex = /(?:[a-zA-Z]:|\\\\)?[\\/][^"'\n$]+[\\/]wpkg-[0-9]+[\\/]install[\\/]runtime/g;

      try {
        if (xFs.sed (file, regex, this._root)) {
          this._resp.log.warn (`target root fixed for ${file}`);
        }
      } catch (ex) {
        if (ex.code !== 'EACCES') {
          throw ex;
        }
        this._resp.log.warn (`${file} is readonly, cannot be fixed`);
      }
    });
  }

  * _patchApply (extra, next) {
    const xDevel = require ('xcraft-core-devel');

    const patchesDir = path.join (this._share, 'patches');
    const srcDir     = path.join (this._share, 'cache', extra.location);

    try {
      yield xDevel.autoPatch (patchesDir, srcDir, this._resp, next);
    } catch (ex) {
      if (ex.code !== 'ENOENT') {
        throw ex;
      }
      this._resp.log.warn ('no cache directory, patches skipped (stub package?)');
    }
  }

  * _peonRun (extra, next) {
    this._resp.log.verb ('Command: %s %s', extra.location, JSON.stringify (extra.args));

    const peonAction = xPeon[this._config.type][this._config.rules.type];
    try {
      yield peonAction (this._config.get, this._root, this._share, extra, this._resp, next);
    } catch (ex) {
      this._resp.log.err (ex.stack || ex);
      this._resp.log.err ('Can not %s %s', this._config.rules.type, this._config.type);
      process.exit (1);
    }
  }

  * _listFromTar (tarFile, next) {
    const tar  = require ('tar-fs');
    const list = [];

    yield fs.createReadStream (tarFile)
      .pipe (tar.extract ('', {
        ignore: entry => {
          list.push (entry);
          return true;
        }
      }))
      .on ('finish', next);

    return list;
  }

  * postinst () {
    const tarFile = path.join (this._root, 'var/lib/wpkg', this._pkg.name, 'data.tar');

    if (this._global) {
      /* Restore the original filenames. */
      const list = yield this._listFromTar (tarFile);

      /* No move here because the files are handled by wpkg. */
      list.forEach ((file) => {
        let newFile = file;
        /* TODO: keep a file with all copies, then it can be removed
         *       with postrm.
         */
        if (/__peon__$/.test (file)) {
          newFile = newFile.replace (/^(.*)__peon__$/, '$1');
        }
        if (/__peon_colon__/.test (file)) {
          newFile = newFile.replace (/__peon_colon__/g, ':');
        }
        if (/__peon_[0-9]+__$/.test (file)) {
          newFile = newFile.replace (/^(.*)__peon_[0-9]+__$/, '$1');
        }
        if (newFile !== file) {
          xFs.cp (file, newFile);
        }
      });
      return;
    }

    const extra = this._getExtra ();
    extra.args = {
      all: this._config.rules.args.postinst
    };

    yield this._patchApply (extra);
    if (!extra.forceConfigure) {
      yield this._peonRun (extra);
      return;
    }

    try {
      const list = yield this._listFromTar (tarFile);
      this._internalConfigure (list);
      yield this._peonRun (extra);
    } catch (ex) {
      this._resp.log.err (ex.stack || ex);
      process.exit (1);
    }
  }

  * prerm () {
    const extra = this._getExtra ();
    extra.args = {
      all: this._config.rules.args.prerm
    };
    yield this._peonRun (extra);
  }

  postrm (wpkgAct) {
    if (!isPackageSrc (this._pkg)) {
      return;
    }

    if (wpkgAct === 'remove') {
      xFs.rm (getBasePath (this._root, this._pkg));
    }
  }

  * makeall () {
    const extra = this._getExtra ();
    extra.args = {
      all:     this._config.rules.args.makeall,
      install: this._config.rules.args.makeinstall
    };
    extra.deploy = this._config.deploy;
    extra.prefix = this._prefix;

    yield this._patchApply (extra);
    yield this._peonRun (extra);
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
  const hook    = process.argv[4];
  const action  = process.argv[5];
  const wpkgAct = process.argv[6];
  const prefix  = process.argv[7];
  const pkg = {
    name:    process.argv[8],
    version: process.argv[9]
  };

  /* HACK: clean PATH; it can be altered by batch scripts like:
   *   set PATH=C:\\blabla;%PATH% && something else
   * A space is added at the end because it should be:
   *   set PATH=C:\\blabla;%PATH%&something else
   */
  process.env.PATH = process.env.PATH.trim ();

  const share = guessSharePath (root, process.argv[3], pkg);

  const xBusClient = require ('xcraft-core-busclient');
  const resp = xBusClient.newResponse (moduleName);

  require ('xcraft-core-log') (moduleName, resp);

  const main = new Action (pkg, root, share, prefix, hook, resp);

  resp.log.verb ('run the action: ' + action);
  main[action] (wpkgAct);
}
