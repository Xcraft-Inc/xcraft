'use strict';
/**
 * !WARNING!
 * filename set namespace of commands
 * ex. mycontrib.js -> mycontrib.example
 */
var moduleName = 'mycontrib';

var path = require('path');

var xLog = require('xcraft-core-log')(moduleName);
var busClient = require('xcraft-core-busclient').getGlobal ();
var config = require('xcraft-core-etc').load('xcraft-contrib-mycontrib');
var cmd = {};

/**
 * Example cmd
 *
 * @param {Object} exampleParam
 */
cmd.example = function(exampleParam) {
	var example = exampleParam.data.example;

	xLog.info(example);
	xLog.info(config.example);

	busClient.events.send('mycontrib.example.finished');
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
	name: 'example',
	message: 'example config ?:',
	default: 'mycontrib example config'
}];
