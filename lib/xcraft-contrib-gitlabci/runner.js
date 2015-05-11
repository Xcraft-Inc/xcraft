'use strict';

var moduleName = 'runner';

var path = require ('path');
var fs   = require ('fs');

var xLog         = require ('xcraft-core-log') (moduleName);
var busClient    = require ('xcraft-core-busclient');
var runnerConfig = require ('xcraft-core-etc').load ('xcraft-contrib-gitlabci');
var cmd = {};

cmd.start = function () {

};

cmd.stop = function () {

};

cmd.restart = function () {

};


cmd.register = function () {
  gcr.client.registerRunner (pubkey, token, function(err, token){
    if (err) {
      xLog.error ('error registering', err)
      // FINISH
    } else {
      gcr.config.set('token', token)
      gcr.config.save(function(err) {
        // FINISH
      });
    }
  });
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
  message: 'Please enter your GitLab CI url',
  default: 'http://ci.epsitec.ch'
}];
