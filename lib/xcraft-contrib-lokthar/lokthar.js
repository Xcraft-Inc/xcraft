'use strict';

var moduleName = 'lokthar';

var path  = require ('path');
var async = require ('async');
var exec  = require ('child_process').exec;

var xPlatform    = require ('xcraft-core-platform');
var xLog         = require ('xcraft-core-log') (moduleName);
var busClient    = require ('xcraft-core-busclient');

var buildDir      = path.join (__dirname, './build/');

var cmd = {};

var installDeps = function (callback) {
  exec ('npm install --prefix ' + buildDir + ' ' + buildDir, function (error, stdout, stderr) {
    xLog.verb ('npm install outputs:\n' + stdout);

    if (error) {
      callback ('unable to install dependencies\n' + stderr);
    } else {
      callback ();
    }
  });
};

var grunt = function (callback) {
  var binGrunt = path.join (__dirname, 'build/node_modules/.bin/grunt' + xPlatform.getCmdExt ());
  var gruntfile = path.join (buildDir, 'gruntfile.js');
  var cmd = binGrunt + ' --verbose --gruntfile ' + gruntfile + ' build-atom-shell';

  exec (cmd, function (error, stdout, stderr) {
    xLog.verb ('grunt lokthar outputs:\n' + stdout);

    if (error) {
      callback ('unable to grunt lokthar\n' + stderr);
    } else {
      callback ();
    }
  });
};

/**
 * Install the lokthar frontend.
 */
cmd.install = function () {
  async.auto ({
    taskInstallDeps: installDeps,
    taskGrunt: ['taskInstallDeps', grunt]
  }, function (err) {
    if (err) {
      xLog.err (err);
    }

    busClient.events.send ('lokthar.install.finished');
  });
};

/**
 * Uninstall the lokthar frontend.
 */
cmd.uninstall = function () {
  xLog.warn ('the uninstall action is not implemented');
  busClient.events.send ('lokthar.uninstall.finished');
};

/**
 * Retrieve the list of available commands.
 *
 * @returns {Object} The list and definitions of commands.
 */
exports.xcraftCommands = function () {
  return {
    handlers: cmd,
    rc: path.join (__dirname, './rc.json')
  };
};
