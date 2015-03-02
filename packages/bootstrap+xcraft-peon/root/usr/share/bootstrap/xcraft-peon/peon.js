'use strict';

var path = require ('path');

var Action = function (root, currentDir, binaryDir) {
  var fs   = require ('fs');

  var xPeon = require ('xcraft-contrib-peon');
  var xPh   = require ('xcraft-core-placeholder');

  var config = JSON.parse (fs.readFileSync (path.join (currentDir, './config.json')));

  if (binaryDir) {
    /* HACK: forced subpackage /runtime
     * we need to rework packageDef model before
     * destination unix arbo. /usr
     */
    var installDir = binaryDir.replace (/build$/, path.normalize ('install/runtime/usr'));
    xPh.set ('INSTALLDIR', installDir);
  }

  var peonRun = function (extra) {
    console.log ('command: %s %s', extra.location, extra.args);

    xPeon[config.type][config.rules.type] (config.uri, root, currentDir, extra, function (err) {
      if (err) {
        console.error (err);
        console.error ('can not %s %s', config.rules.type, config.type);
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
      extra.args = config.rules.args.postinst;
      peonRun (extra);
    },

    prerm: function () {
      extra.args = config.rules.args.prerm;
      peonRun (extra);
    },

    makeall: function () {
      extra.args = config.rules.args.makeall;
      peonRun (extra);
    }
  };
};

if (process.argv.length >= 4) {
  var root = process.argv[2];
  var share = path.join (root, process.argv[3]);
  var action = process.argv[4];
  var prefix = process.argv[5];
  var main = new Action (root, share, prefix);

  console.log ('run the action: ' + action);
  main[action] ();
}
