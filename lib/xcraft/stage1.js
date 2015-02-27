'use strict';

var moduleName = 'bootstrap';

var path  = require ('path');
var spawn = require ('child_process').spawn;


process.chdir (path.join (__dirname, '../..'));

var init = process.argv.slice (2);
require ('./lib/boot.js') (init);

var getCmdExt = function () {
  return /^win/.test (process.platform) ? '.cmd' : '';
};

var installStrongDeps = function (callback) {
  try {
    var npm = 'npm' + getCmdExt ();
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

var execCmd = function (bin, verb, args, callback) {
  var util = require ('util');

  try {
    var node = null;
    var finalArgs = [];

    if (util.isArray (bin)) {
      node = bin[0];
      finalArgs.push (bin[1]);
    } else {
      node = bin;
    }

    finalArgs.push (verb);

    if (args.length > 0) {
      finalArgs = finalArgs.concat (args);
    }

    var nodeCmd = spawn (node, finalArgs);

    nodeCmd.stdout.on ('data', function (data) {
      data.toString ().replace (/\r/g, '').split ('\n').forEach (function (line) {
        if (line.trim ().length) {
          console.log (line);
        }
      });
    });

    nodeCmd.stderr.on ('data', function (data) {
      data.toString ().replace (/\r/g, '').split ('\n').forEach (function (line) {
        if (line.trim ().length) {
          console.log (line);
        }
      });
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
  /* Don't use the root xcraft command here, because it relies on the xcraft
   * config file which is still not available.
   */
  execCmd (['node', path.join (__dirname, './bin/xcraft.js')], verb, args, callback);
};

var execZog = function (verb, args, callback) {
  var zog = 'zog' + getCmdExt ();
  execCmd (path.resolve (zog), verb, args, callback);
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
      console.log ('[stage2] Info: build and install the package manager');
      process.env.XCRAFT_ATTACH = 1;
      process.env.XCRAFT_LOG    = 0;

      execZog ('bootstrap.all', [], callback);
    }
  ], function (err) {
    if (err) {
      console.log ('[' + moduleName + '] Err: ' + err);
    }
  });
});
