'use strict';

var moduleName = 'stage1';

var path  = require ('path');
var spawn = require ('child_process').spawn;


var prepare = [
  'async',
  'axon',
  'cli-color',
  'express',
  'fs-extra',
  'grunt',
  'grunt-cli',
  'grunt-newer-explicit',
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

var init = process.argv;

/*[
  'C:\\Users\\Jonny\\workspace\\cresus\\toolchain\\bootstrap-windev\\sysroot\\bin',
  'C:\\Users\\Jonny\\workspace\\cresus\\toolchain\\bootstrap-windev\\sysroot\\opt\\nodejs',
  'C:\\Users\\Jonny\\workspace\\cresus\\toolchain\\bootstrap-windev\\sysroot\\opt\\bin',
  'C:\\Users\\Jonny\\workspace\\cresus\\toolchain\\bootstrap-windev\\sysroot\\msys\\1.0\\bin'
];*/




var getNodeJSPathFromArgs = function (args) {
  var output;

  args.forEach (function (arg) {
    if (arg.indexOf ('nodejs') !== -1) {
      output = arg;
    }
  });

  return output;
};

var installStrongDeps = function (callback) {
  var packages = ['commander', 'inquirer'];

  try {
    var ext = /^win/.test (process.platform) ? '.cmd' : '';

    var npm = path.resolve (getNodeJSPathFromArgs (init), 'npm' + ext);
    var args = ['install'];

    args = args.concat (packages);

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

    installCmd.on('close', function (code) { /* jshint ignore:line */
      callback ();
    });
  } catch (err) {
    console.log ('[' + moduleName + '] Err: ' + err);
  }
};


var execCmd = function (verb, args, callback) {
  try {
    var ext = /^win/.test (process.platform) ? '.exe' : '';
    var node = path.resolve (getNodeJSPathFromArgs (init), 'node' + ext);
    var separator = /^win/.test (process.platform) ? '\\' : '/';
    var finalArgs = ['.'+separator+'scripts'+separator+'xcraft.js', '--' + verb];

    if (args.length > 0) {
      finalArgs.push (args.toString ());
    }


    var nodeCmd = spawn (node, finalArgs);

    nodeCmd.stdout.on('data', function (data) {
      console.log('' + data);
    });

    nodeCmd.on('error', function (err) {
      console.log(err);
    });

    nodeCmd.on('close', function (code) { /* jshint ignore:line */
      callback ();
    });
  } catch (err) {
    console.log ('[' + moduleName + '] Err: ' + err);
  }
};



// Is there  way to avoid async command execution??
console.log ('[' + moduleName + '] Info: install strong dependencies');
installStrongDeps ( function () {
  console.log ('[' + moduleName + '] Info: config initialization');
  execCmd ('init', init, function () {
    console.log ('[' + moduleName + '] Info: dependencies installation');
    execCmd ('prepare', prepare, function () {
      console.log ('[' + moduleName + '] Info: uNPM deployment');
      execCmd ('deploy', ['localhost', '8485'], function () {
        console.log ('[' + moduleName + '] Info: core packets publication');
        execCmd ('publish', [], function () {
          console.log ('[' + moduleName + '] Info: core packets installation');
          execCmd ('install', [], function () {
            console.log ('[' + moduleName + '] Info: final configuration');
            execCmd ('configure', ['all'], function () {});
          });
        });
      });
    });
  });
});
