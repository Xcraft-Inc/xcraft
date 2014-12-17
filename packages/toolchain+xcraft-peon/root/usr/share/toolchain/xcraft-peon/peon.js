'use strict';

var Action = function (currentDir) {
  var fs   = require ('fs');
  var path = require ('path');

  var xPeon = require ('xcraft-core-peon');

  var config = JSON.parse (fs.readFileSync (path.join (currentDir, './config.json')));

  var peonRun = function (extra) {
    console.log ('command: %s %s', extra.location, extra.args);

    xPeon[config.type][config.rules.type] (config.uri, null, currentDir, extra, function (done) {
      if (!done) {
        console.error ('can not %s %s', config.rules.type, config.type);
        process.exit (1);
      }
    });
  };

  return {
    postinst: function () {
      var extra = {
        location: config.rules.location,
        args:     config.rules.args.install
      };

      peonRun (extra);
    },

    prerm: function () {
      var extra = {
        location: config.rules.location,
        args:     config.rules.args.remove
      };

      peonRun (extra);
    },

    makeAll: function () {
      var extra = {
        location: config.rules.location,
        args:     ''
      };

      peonRun (extra);
    }
  };
};

if (process.argv.length >= 4) {
  var main = new Action (process.argv[2]);

  console.log ('run the action: ' + process.argv[3]);
  main[process.argv[3]] ();
}
