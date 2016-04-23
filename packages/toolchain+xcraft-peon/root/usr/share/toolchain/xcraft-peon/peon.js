'use strict';

const moduleName = 'peon';

var path = require ('path');
var fs   = require ('fs');

var xFs  = require ('xcraft-core-fs');


function internalConfigure (root, fileList, response) {
  fileList.forEach (_file => {
    const file = path.join (root, _file);

    if (!fs.existsSync (file) || fs.statSync (file).isDirectory ()) {
      return;
    }

    const regex = /(?:[a-zA-Z]:|\\\\)?[\\/][^"']+[\\/]wpkg-[0-9]+[\\/]install[\\/]runtime/g;

    if (xFs.sed (file, regex, root)) {
      response.log.warn (`target root fixed for ${file}`);
    }
  });
}

var genConfig = function (currentDir, prefixDir, config) {
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
  var fullName = currentDir.match (/.[\/\\]([^\/\\]+)[\/\\]([^\/\\]+)[\/\\]?$/);

  var shareDir = path.join (prefixDir, 'share', fullName[1], fullName[2]);
  xFs.mkdir (shareDir);

  fs.writeFileSync (path.join (shareDir, 'config.json'), data);
};

var Action = function (pkg, root, currentDir, binaryDir, response) {
  var xPeon     = require ('xcraft-contrib-peon');
  var xPh       = require ('xcraft-core-placeholder');
  var xPlatform = require ('xcraft-core-platform');

  var config = JSON.parse (fs.readFileSync (path.join (currentDir, './config.json')));

  /* This condition is true only when wpkg is building a new binary package
   * from a source package.
   */
  if (binaryDir) {
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
    ['postinst', 'prerm'].forEach (function (script) {
      script = script + xPlatform.getShellExt ();
      xFs.cp (path.join (root, script), path.join (installWpkgDir, script));
    });

    /* Generate the config.json file. */
    genConfig (currentDir, prefixDir, config.runtime);

    /* Copy etc/ files if available. */
    try {
      xFs.cp (path.join (root, 'etc'), path.join (installDir, 'etc'));
    } catch (ex) {
      response.log.warn ('the etc/ directory is not available');
    }
  }

  var patchApply = function (extra, callback) {
    var xDevel = require ('xcraft-core-devel');

    var patchesDir = path.join (currentDir, 'patches');
    var srcDir     = path.join (currentDir, 'cache', extra.location);

    xDevel.autoPatch (patchesDir, srcDir, response, callback);
  };

  var peonRun = function (extra) {
    response.log.verb ('Command: %s %s', extra.location, JSON.stringify (extra.args));

    xPeon[config.type][config.rules.type] (config.get, root, currentDir, extra, response, function (err) {
      if (err) {
        response.log.err (err);
        response.log.err ('Can not %s %s', config.rules.type, config.type);
        process.exit (1);
      }
    });
  };

  var extra = {
    location:  config.rules.location,
    configure: config.configure,
    embedded:  config.embedded
  };

  return {
    postinst: function () {
      extra.args = {
        all: config.rules.args.postinst
      };

      if (config.rules.type === 'configure') {
        extra.forceConfigure = true;
      }

      patchApply (extra, function () {
        if (!extra.forceConfigure) {
          peonRun (extra);
          return;
        }

        const tar  = require ('tar-fs');
        const tarFile = path.join (root, 'var/lib/wpkg', pkg.name, 'data.tar');
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
              response.log.err (err);
              process.exit (1);
            }

            internalConfigure (root, list, response);
            peonRun (extra);
          });
      });
    },

    prerm: function () {
      extra.args = {
        all: config.rules.args.prerm
      };
      peonRun (extra);
    },

    makeall: function () {
      extra.args = {
        all:     config.rules.args.makeall,
        install: config.rules.args.makeinstall
      };
      extra.deploy = config.deploy;

      patchApply (extra, function () {
        peonRun (extra);
      });
    }
  };
};

function explodeName (name) {
  return {
    prefix: name.replace (/\+.*/, ''),
    name:   name.replace (/.*\+/, '').replace (/-src$/, '')
  };
}

function isPackageSrc (pkg) {
  return /-src$/.test (pkg.name);
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

function guessSharePath (root, share, pkg) {
  if (share && share.length) {
    return path.join (root, share);
  }

  const base    = getBasePath (root, pkg);
  const expName = explodeName (pkg.name);

  return path.join (base, `usr/share/${expName.prefix}/${expName.name}`);
}

function postrm (root, pkg) {
  if (!isPackageSrc (pkg)) {
    return;
  }

  xFs.rm (getBasePath (root, pkg));
}

if (process.argv.length >= 4) {
  var root   = process.argv[2];
  var action = process.argv[4];
  var prefix = process.argv[5];
  var pkg = {
    name:    process.argv[6],
    version: process.argv[7]
  };

  const share = guessSharePath (root, process.argv[3], pkg);

  const xBusClient = require ('xcraft-core-busclient');
  const response = xBusClient.newResponse (moduleName);

  require ('xcraft-core-log') (moduleName, response);

  if (action !== 'postrm') {
    var main = new Action (pkg, root, share, prefix, response);

    response.log.verb ('run the action: ' + action);
    main[action] ();
  } else {
    postrm (root, pkg);
  }
}
