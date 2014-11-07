'use strict';

var moduleName = 'stage1';

var path  = require ('path');
var spawn = require ('child_process').spawn;


process.chdir (path.join (__dirname, '..'));

var prepare = [
  'unpm',
  'unpm-fs-backend'
];

var init = process.argv.slice (2);

process.env.PATH = init.join (path.delimiter);

var installStrongDeps = function (callback) {
  var packages = ['async', 'shellcraft'];

  try {
    var ext = /^win/.test (process.platform) ? '.cmd' : '';

    var npm = 'npm' + ext;
    var args = ['install'];

    args = args.concat (packages);

    var installCmd = spawn (npm, args);

    installCmd.stdout.on ('data', function (data) {
      data.toString ().replace (/\r/g, '').split ('\n').forEach (function (line) {
        if (line.trim ().length) {
          console.log (line);
        }
      });
    });

    installCmd.stderr.on ('data', function (data) {
      data.toString ().replace (/\r/g, '').split ('\n').forEach (function (line) {
        if (line.trim ().length) {
          console.log (line);
        }
      });
    });

    installCmd.on ('close', function (code) { /* jshint ignore:line */
      callback ();
    });
  } catch (err) {
    console.log ('[' + moduleName + '] Err: ' + err);
  }
};

var execCmd = function (verb, args, callback) {
  try {
    var node = 'node';
    var finalArgs = [
      path.resolve ('./scripts/xcraft.js'),
      verb
    ];

    if (args.length > 0) {
      finalArgs.push (args.join (','));
    }

    var nodeCmd = spawn (node, finalArgs);

    nodeCmd.stdout.on ('data', function (data) {
      console.log ('' + data);
    });

    nodeCmd.stderr.on ('data', function (data) {
      console.log ('' + data);
    });

    nodeCmd.on ('error', function (err) {
      console.log (err);
    });

    nodeCmd.on ('close', function (code) { /* jshint ignore:line */
      callback ();
    });
  } catch (err) {
    console.log ('[' + moduleName + '] Err: ' + err);
  }
};

console.log ('[' + moduleName + '] Info: install strong dependencies');
installStrongDeps (function () {
  var async = require ('async');

  async.series ([
    function (callback) {
      console.log ('[' + moduleName + '] Info: config initialization');
      execCmd ('init', init, callback);
    },
    function (callback) {
      console.log ('[' + moduleName + '] Info: dependencies installation');
      execCmd ('prepare', prepare, callback);
    },
    function (callback) {
      console.log ('[' + moduleName + '] Info: uNPM deployment');
      execCmd ('deploy', ['localhost', '8485'], callback);
    },
    function (callback) {
      console.log ('[' + moduleName + '] Info: core packets publication');
      execCmd ('publish', [], callback);
    },
    function (callback) {
      console.log ('[' + moduleName + '] Info: core packets installation');
      execCmd ('install', [], callback);
    },
    function (callback) {
      console.log ('[' + moduleName + '] Info: final configuration');
      execCmd ('defaults', ['all'], callback);
    }
  ], function (err) {
    if (err) {
      console.log ('[' + moduleName + '] Err: ' + err);
    }
  });
});
