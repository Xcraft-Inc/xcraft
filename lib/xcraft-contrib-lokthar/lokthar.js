'use strict';

var moduleName = 'lokthar';

var fs    = require ('fs');
var path  = require ('path');
var async = require ('async');
var exec  = require ('child_process').exec;

var xPlatform    = require ('xcraft-core-platform');
var xLog         = require ('xcraft-core-log') (moduleName);
var busClient    = require ('xcraft-core-busclient');

var buildDir      = path.join (__dirname, './build/');
var atomDir       = path.join (__dirname, './build/atom-shell/');
var loktharAppDir = path.join (__dirname, './lokthar-app');

var cmd = {};

var build = function (callback) {
  exec ('npm install --prefix ' + buildDir + ' ' + buildDir, function (error, stdout, stderr) {
    xLog.verb ('build lokthar outputs:\n' + stdout);

    if (error) {
      callback ('unable to build lokthar\n' + stderr);
    } else {
      callback ();
    }
  });
};

var grunt = function (callback) {
  var binGrunt = path.join (__dirname, 'build/node_modules/.bin/grunt' + xPlatform.getCmdExt ());
  var gruntfile = path.join (buildDir, 'gruntfile.js');
  var cmd = binGrunt + ' --gruntfile ' + gruntfile + ' download-atom-shell';

  exec (cmd, function (error, stdout, stderr) {
    xLog.verb ('grunt lokthar outputs:\n' + stdout);

    var atom = path.join (atomDir, 'atom' + xPlatform.getExecExt ());
    /* chmod +x flag to atom for Unix, ignored on Windows. */
    fs.chmodSync (atom, 493 /* 0755 */);

    if (error) {
      callback ('unable to grunt lokthar\n' + stderr);
    } else {
      callback ();
    }
  });
};

/**
 * Run the lokthar frontend.
 * Lokthar is based on atom-shell.
 */
cmd.run = function () {
  var atom = path.join (atomDir, 'atom' + xPlatform.getExecExt ());

  /* We provide bus token for lokthar via argv[2]. */
  var busToken = busClient.getToken ();

  exec (atom + ' ' + loktharAppDir + ' ' + busToken, function (error, stdout, stderr) {
    xLog.verb ('atom outputs:\n' + stdout);

    if (error) {
      xLog.err ('unable to exec atom\n' + stderr);
    }

    busClient.events.send ('lokthar.run.finished');
  });
};

/**
 * Install the lokthar frontend.
 */
cmd.install = function () {
  async.auto ({
    taskBuild: build,
    taskGrunt: ['taskBuild', grunt]
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
 * @returns {Object[]} The list of commands.
 */
exports.xcraftCommands = function () {
  var utils  = require ('xcraft-core-utils');
  var rcFile = path.join (__dirname, './rc.json');
  var rc     = utils.jsonFile2Json (rcFile);
  var list = [];

  Object.keys (cmd).forEach (function (action) {
    list.push ({
      name   : action,
      desc   : rc[action] ? rc[action].desc : '',
      params : rc[action] ? rc[action].params : '',
      handler: cmd[action]
    });
  });

  return list;
};
