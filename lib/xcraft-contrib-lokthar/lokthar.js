'use strict';

var moduleName = 'lokthar';

var fs     = require ('fs');
var path   = require ('path');
var async  = require ('async');
var exec   = require ('child_process').exec;
var config = require ('xcraft-core-etc').load ('xcraft-contrib-lokthar');

var xPlatform    = require ('xcraft-core-platform');
var xLog         = require ('xcraft-core-log') (moduleName);
var busClient    = require ('xcraft-core-busclient');

var buildDir      = path.join (__dirname, './build/');
var atomDir       = path.join (__dirname, './build/atom-shell/');

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
 *
 * @returns {Object} The list and definitions of commands.
 */
exports.xcraftCommands = function () {
  return {
    handlers: cmd,
    rc: path.join (__dirname, './rc.json')
  };
};

/**
* Retrieve the inquirer definition for xcraft-core-etc
*/
exports.xcraftConfig = [{
  type: 'input',
  name: 'appstore',
  message: 'path to app store:',
  default: './var/app/'
},
{
  type: 'input',
  name: 'appname',
  message: 'lokthar app name',
  default: 'lokthar-react-app'
}];
