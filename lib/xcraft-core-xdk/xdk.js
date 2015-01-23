'use strict';
var moduleName = 'xdk';

var path = require('path');

var xLog = require('xcraft-core-log')(moduleName);
var busClient = require('xcraft-core-busclient');
var config = require('xcraft-core-etc').load('xcraft-core-xdk');
var cmd = {};

/**
 * Generate project template with yeoman
 *
 * @param {Object} chestMsg
 */
cmd.gen = function(cmd) {
	var generator = cmd.data.generator;
	xLog.info('using ' + config.home);
	xLog.info(generator);

	busClient.events.send('xdk.gen.finished');
};

/**
 * Retrieve the list of available commands.
 *
 * @returns {Object} The list and definitions of commands.
 */
exports.xcraftCommands = function() {
	return {
		handlers: cmd,
		rc: path.join(__dirname, './rc.json')
	};
};

/**
 * Retrieve the inquirer definition for xcraft-core-etc
 */
exports.xcraftConfig = [{
	type: 'input',
	name: 'home',
	message: 'XDK home folder:',
	default: '/home/xdk/'
}];
