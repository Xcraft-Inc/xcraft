'use strict';

var moduleName = 'peon';

var path = require ('path');

var xLog = require ('xcraft-core-log') (moduleName);


var Action = function (root, currentDir, binaryDir) {
  var fs   = require ('fs');

  var xPeon     = require ('xcraft-contrib-peon');
  var xPh       = require ('xcraft-core-placeholder');
  var xFs       = require ('xcraft-core-fs');
  var xPlatform = require ('xcraft-core-platform');

  var config = JSON.parse (fs.readFileSync (path.join (currentDir, './config.json')));

  if (binaryDir) {
    /* HACK: forced subpackage /runtime
     * we need to rework packageDef model before
     * destination unix arbo. /usr
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
    var newConfig = {
      type: 'bin',
      configure: config.runtime.configure,
      rules: {
        type: 'meta',
        location: '',
        args: {}
      },
      embedded: true
    };
    var data = JSON.stringify (newConfig, null, '  ');
    var fullName = currentDir.match (/.\/([^\/]+)\/([^\/]+)\/?$/);
    var shareDir = path.join (prefixDir, 'share', fullName[1], fullName[2]);
    xFs.mkdir (shareDir);
    fs.writeFileSync (path.join (shareDir, 'config.json'), data);
  }

  var patchApply = function (extra, callback) {
    var xDevel = require ('xcraft-core-devel');

    var patchesDir = path.join (currentDir, 'patches');
    var srcDir     = path.join (currentDir, 'cache', extra.location);

    xDevel.autoPatch (patchesDir, srcDir, callback);
  };

  var peonRun = function (extra) {
    xLog.verb ('Command: %s %s', extra.location, JSON.stringify (extra.args));

    xPeon[config.type][config.rules.type] (config.get, root, currentDir, extra, function (err) {
      if (err) {
        xLog.err (err);
        xLog.err ('Can not %s %s', config.rules.type, config.type);
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
        postinst: config.rules.args.postinst
      };

      patchApply (extra, function () {
        peonRun (extra);
      });
    },

    prerm: function () {
      extra.args = {
        prerm: config.rules.args.prerm
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

if (process.argv.length >= 4) {
  var root = process.argv[2];
  var share = path.join (root, process.argv[3]);
  var action = process.argv[4];
  var prefix = process.argv[5];
  var main = new Action (root, share, prefix);

  xLog.verb ('run the action: ' + action);
  main[action] ();
}
