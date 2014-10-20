'use strict';

var moduleName = 'test';
var fs = require("fs");
var path = require("path");
var spawn  = require ('child_process').spawn;


var prepare = [
  'async',
  'axon',
  'cli-color',
  'commander',
  'express',
  'fs-extra',
  'grunt',
  'grunt-cli',
  'grunt-newer-explicit',
  'inquirer',
  'js-yaml',
  'progress',
  'progress-stream',
  'request',
  'shell',
  'socket.io',
  'socket.io-client',
  'tar',
  'tar.gz',
  'unpm',
  'unpm-fs-backend'
];

var configure = [
  'xcraft-core-etc',
  'xcraft-core-utils',
  'xcraft-core-fs',
  'xcraft-core-scm',
  'xcraft-core-peon',
  'xcraft-core-http',
  'xcraft-core-extract',
  'xcraft-core-log',
  'xcraft-core-process',
  'xcraft-core-platform',
  'xcraft-core-bus',
  'xcraft-core-busclient',
  'xcraft-core-devel',
  'xcraft-core-uri',
  'xcraft-core-bin',
  'xcraft-contrib-chest',
  'xcraft-contrib-cmake',
  'xcraft-contrib-pacman',
  'xcraft-contrib-wpkg',
  'xcraft-contrib-lokthar',
  'xcraft-zog'
];

var init = [
	'C:\\Users\\Jonny\\workspace\\cresus\\toolchain\\bootstrap-windev\\sysroot\\bin',
    'C:\\Users\\Jonny\\workspace\\cresus\\toolchain\\bootstrap-windev\\sysroot\\opt\\nodejs',
    'C:\\Users\\Jonny\\workspace\\cresus\\toolchain\\bootstrap-windev\\sysroot\\opt\\bin',
    'C:\\Users\\Jonny\\workspace\\cresus\\toolchain\\bootstrap-windev\\sysroot\\msys\\1.0\\bin'
];

var execCmd = function(verb, args)
{
	try {
	    var ext = /^win/.test (process.platform) ? '.cmd' : '';
		var node = './node' + ' ./scripts/xcraft.js --' + verb;
		var finalArgs = [];

		finalArgs = finalArgs.concat (args);
		var cmd = node + ' ' + finalArgs;
		console.log (node + ' ' + finalArgs);
		
		var nodeCmd = spawn ('cmd', ['/c', cmd]);

		nodeCmd.on('error', function() { console.log(arguments); });
	} catch (err) {
		console.log ('[' + moduleName + '] Err: ' + err);
	}
}

execCmd ('init', init);
/*execCmd ('prepare', prepare);
execCmd ('deploy', ['localhost', '8485']);
execCmd ('publish', []);
execCmd ('install', []);
execCmd ('configure', ['all']);*/
