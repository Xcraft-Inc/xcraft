'use strict';

var moduleName = 'bootstrap';

var path  = require ('path');
var spawn = require ('child_process').spawn;


process.chdir (path.join (__dirname, '../..'));

var init = process.argv.slice (2);
require ('./lib/boot.js') (init);

var installStrongDeps = function (callback) {
  try {
    var ext = /^win/.test (process.platform) ? '.cmd' : '';

    var npm = 'npm' + ext;
    var args = ['install'];

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

/* TODO: use the main root xcraft command. */
var execCmd = function (bin, verb, args, callback) {
  try {
    var node = 'node';
    var finalArgs = [bin, verb];

    if (args.length > 0) {
      finalArgs = finalArgs.concat (args);
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

var execXcraft = function (verb, args, callback) {
  execCmd (path.join (__dirname, './bin/xcraft.js'), verb, args, callback);
};

var execZog = function (verb, args, callback) {
  execCmd (path.resolve ('node_modules/xcraft-zog/bin/zog'), verb, args, callback);
};

console.log ('[' + moduleName + '] Info: install strong dependencies');
installStrongDeps (function () {
  var async = require ('async');

  async.series ([
    function (callback) {
      console.log ('[stage1] Info: config initialization');
      execXcraft ('init', init, callback);
    }, function (callback) {
      console.log ('[stage1] Info: uNPM deployment');
      execXcraft ('deploy', ['localhost:8485'], callback);
    }, function (callback) {
      console.log ('[stage1] Info: core packets publication');
      execXcraft ('publish', [], callback);
    }, function (callback) {
      console.log ('[stage1] Info: core packets installation');
      execXcraft ('install', [], callback);
    }, function (callback) {
      console.log ('[stage1] Info: final configuration');
      execXcraft ('defaults', [], callback);
    }, function (callback) {
      console.log ('[stage2] Info: build and install CMake');
      /* FIXME: use the server as daemon.
       * It can't be done because the logging is not available if the server is
       * not attached.
       */
      process.env.XCRAFT_ATTACH = 1;
      process.env.XCRAFT_LOG    = 0;

      execZog ('cmake.build', [], callback);
    }, function (callback) {
      console.log ('[stage2] Info: build and install WPKG');
      execZog ('wpkg.build', [], callback);
    }
  ], function (err) {
    if (err) {
      console.log ('[' + moduleName + '] Err: ' + err);
    }
  });
});
