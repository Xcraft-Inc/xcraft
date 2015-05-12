'use strict';

var moduleName = 'gitlab-ci';

var path         = require ('path');
var xFs          = require ('xcraft-core-fs');
var fs           = require ('fs');
var xLog         = require ('xcraft-core-log') (moduleName);
var xConf        = require ('xcraft-core-etc').load ('xcraft');
var config       = require ('xcraft-core-etc').load ('xcraft-contrib-gitlabci');
var busClient    = require ('xcraft-core-busclient');
var ciClient     = require ('./lib/client.js') ();
var cmd = {};

cmd.start = function () {

};

cmd.stop = function () {

};

cmd.restart = function () {

};


cmd.create = function (msg) {
  var publicToken  = msg.data.token;
  ciClient.registerRunner (publicToken, function (err, runner) {
    if (err) {
      xLog.err ('Error during runner registration:', err);
      busClient.events.send ('ci.runners.create.finished');
      return;
    }
    var runnerDir = path.join (xConf.xcraftRoot,
                               config.configDir,
                               runner.id.toString ());
    var fileName  = path.join (runnerDir, 'runner-config.json');
    try {
      xFs.mkdir (runnerDir);
    } catch (err) {
      xLog.err ('Error during runner repo. creation:', err);
      busClient.events.send ('ci.runners.create.finished');
    }
    xLog.info ('Runner %s created!', runner.id);
    fs.writeFileSync (fileName,
                      JSON.stringify (runner, null, '  ')
                     );
    busClient.events.send ('ci.runners.create.finished');
  });
};

cmd.delete = function (msg) {
  var runnerId  = msg.data.id;
  var runnerDir = path.join (xConf.xcraftRoot,
                             config.configDir,
                             runnerId);
  var fileName  = path.join (runnerDir, 'runner-config.json');

  fs.readFile (fileName, 'utf8', function (err, data) {
    if (err) {
      xLog.err ('Bad runner id');
      busClient.events.send ('ci.runners.delete.finished');
      return;
    }
    ciClient.deleteRunner (JSON.parse (data), function (err, runner) {
      xFs.rm (runnerDir);
      xLog.info ('Runner %s deleted', runner.id);
      busClient.events.send ('ci.runners.delete.finished');
    });
  });
};

cmd.list = function () {

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
  name: 'url',
  message: 'GitLab CI url',
  default: 'https://ci.epsitec.ch'
}, {
  type: 'confirm',
  name: 'strictSSL',
  message: 'Use strict SSL?',
  default: true
}, {
  type: 'input',
  name: 'configDir',
  message: 'Runners repository:',
  default: './var/xcraft-contrib-gitlabci/'
}];
