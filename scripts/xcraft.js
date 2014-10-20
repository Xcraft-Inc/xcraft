'use strict';

var moduleName = 'xcraft';
var fs = require("fs");
var path = require("path");
var spawn  = require ('child_process').spawn;
var async = require ('async');

var program = require ('commander');
var inquirer = require ('inquirer');


var startUNPMService = function()
{
  var backend = require ('unpm-fs-backend');
  var dataDir = path.resolve ('./usr/share/unpm');
  var config  = {
    configfile: path.resolve ('./etc/unpm/config.json')
  };

  var tarballsDir = path.join (dataDir, 'tarballs');
  var userDir     = path.join (dataDir, 'users');
  var metaDir     = path.join (dataDir, 'meta');
  var storeDir    = path.join (dataDir, 'store');

  config.backend = backend (metaDir, userDir, tarballsDir, storeDir);

  var unpm = require ('unpm');
  var unpmService = unpm (config);
  unpmService.server.listen (unpmService.config.host.port);
  
  return unpmService;
}


var inquire = function(fct)
{
	var args = [];
	console.log ('[' + moduleName + '] Info: welcome to the arg console. Type <exit> to start processing the arguments');
	
	async.forever(
		function(next) {
			var question = {
				type: 'input',
				name: 'arg',
				message: 'zog:arg>'
			}
			
			inquirer.prompt([question], function( answers ) {
				if (answers['arg'] === 'exit') {
					next (1);
				} else {
					if (answers['arg'].length > 0) {
						args.push (answers['arg']);
					}
					next ();
				}
			});
		},
		function(err) {
			if (args.length > 0) {
				console.log ('[' + moduleName + '] Info: start processing');
				fct (args);
			}
		}
	);
}


var install = function (packages, useLocalRegistry, hostname, port)
{	
	console.log ('[' + moduleName + '] Info: install dependencies');

	try {
		var ext = /^win/.test (process.platform) ? '.cmd' : '';
		var npm = 'npm' + ext + ' install';
		var args = [];

		if (useLocalRegistry) {
			npm = npm + ' --registry' + ' http://' + hostname + ':' + port;
		}
		
		args = args.concat (packages);

		console.log (npm + ' ' + args);
		
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
	} catch (err) {
		console.log ('[' + moduleName + '] Err: ' + err);
	}
};


var publish = function (packageToPublish, hostname, port) {
  console.log ('[' + moduleName + '] Info: publish ' + packageToPublish + ' in µNPM');

  try {
    var ext = /^win/.test (process.platform) ? '.cmd' : '';
    var npm = 'npm' + ext + ' --registry' + ' http://' + hostname + ':' + port + ' publish';
    var args = [];
    var packagePath = path.join ('lib/', packageToPublish);
    args.push (packagePath);

	console.log (npm + ' ' + args);
	
    var publishCmd = spawn (npm, args);

    publishCmd.stdout.on ('data', function (data) {
      data.toString ().replace (/\r/g, '').split ('\n').forEach (function (line) {
        if (line.trim ().length) {
          console.log (line);
        }
      });
    });

    publishCmd.stderr.on ('data', function (data) {
      data.toString ().replace (/\r/g, '').split ('\n').forEach (function (line) {
        if (line.trim ().length) {
          console.log (line);
        }
      });
    });
	
  } catch (err) {
    console.log ('[' + moduleName + '] Err: ' + err);
  }
};


var createConfig = function (paths) {
  var root       = path.resolve ('./');

  return {
    xcraftRoot       : root,
    scriptsRoot      : path.resolve (root, './scripts/'),
    zogRc            : path.resolve (root, './.zogrc'),
    npmRc            : path.resolve (root, './.npmrc'),
    zogBoot          : path.resolve (root, './scripts/zogBoot.js'),
    loktharRoot      : path.resolve (root, './lokthar/'),
    nodeModulesRoot  : path.resolve (root, './node_modules/'),
    tempRoot         : path.resolve (root, './var/tmp/'),
    pkgTempRoot      : path.resolve (root, './var/tmp/wpkg/'),
    pkgDebRoot       : path.resolve (root, './var/wpkg/'),
    pkgBaseRoot      : path.resolve (root, './packages/base/'),
    pkgProductsRoot  : path.resolve (root, './packages/products/'),
    pkgTemplatesRoot : path.resolve (root, './templates/wpkg/'),
    pkgTargetRoot    : path.resolve (root, './var/devroot/'),
    busBoot          : path.resolve (root, './scripts/bus/busBoot.js'),
    confWizard       : path.resolve (root, './scripts/config/confWizard.js'),
    confDefaultFile  : path.resolve (root, './scripts/zog.yaml'),
    confUserFile     : path.resolve (root, './zog.yaml'),
    nodeModules      : path.resolve (root, './node_modules/'),
    binGrunt         : path.resolve (root, './node_modules/', 'grunt-cli/bin/grunt'),
	path			 : [
		path.resolve (paths[0]),
		path.resolve (paths[1]),
		path.resolve (paths[2]),
		path.resolve (paths[3])
	]
  };
};


var writeConfig = function (paths)
{
  var fs         = require ('fs');
  var path       = require ('path');
  var dir  		 = path.resolve ('./etc/xcraft/');
  var fileName   = path.join (dir, 'config.json');

  if (!fs.existsSync(dir)) {
    fs.mkdirSync (dir);
  }

  console.log (createConfig (paths));
  fs.writeFileSync (fileName, JSON.stringify (createConfig (paths), null, '  '));
}


var deploy = function (conf)
{	
	var configFile = path.resolve ('./etc/unpm/config.json');
	var config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
	
	config.host.hostname = confArray[0];
	config.host.port = confArray[1];

	console.log (JSON.stringify (config, null, '  '));
	fs.writeFileSync (configFile, JSON.stringify (config, null, '  '));
}


var init = function (paths)
{
	writeConfig (paths);
}

var configure = function (modules)
{
	var xEtc = require ('xcraft-core-etc');

	if(modules.length > 0 && modules[0] === 'all') {
		console.log ('xcraft-* all');
		xEtc.createAll (path.resolve ('./node_modules/'), /^xcraft-(core|contrib)/);
	} else {	
		modules.forEach (function (mod) {
			console.log ('xcraft-' + mod);
			xEtc.createAll (path.resolve ('./node_modules/'), '/^xcraft-' + mod + '/');
		});
	}
}



program
  .version ('0.0.1')
  .option ('-v, --verbose', 'increases the verbosity level')

  .option ('--prepare [deps]', 'npm install third packages')
  .option ('--deploy [configuration]', 'configure uNPM with backend <IP address,port>')
  .option ('--init [paths]', 'create main config file in etc')
  .option ('--configure <modules>', 'create xcraft-* config in etc. If module is all, create config for all installed modules')
  .option ('--install', 'install xcraft-zog from local registry')
  .option ('--publish', 'npm publish xcraft-core in local registry')
  .option ('--verify', 'check outdated packages')
  .parse (process.argv);

  
if (program.deploy) {
	deploy (program.deploy.split(','));
}

  
if (program.prepare) {
	if (program.prepare === true) {
		inquire(install);
	} else {
		install (program.prepare.split(','));
	}
}

if (program.init) {
	if (program.init === true) {
		inquire(init);
	} else {
		init (program.init.split(','));
	}
}

if (program.configure) {
	if (program.configure === true) {
		inquire(configure);
	} else {
		configure ( program.configure.split(','));
	}
}


if (program.install) {
  unpmService = startUNPMService ();


  async.eachSeries (['xcraft-zog'], function (packageToInstall) {
    install (packageToInstall, true, unpmService.config.host.hostname, unpmService.config.host.port);
  },
  function (err) {
	unpmService.server.close ();
  });
}


if (program.publish) {
  unpmService = startUNPMService ();
  
  var packages = fs.readdirSync ('./lib/');
  
  async.eachSeries (packages, function (packageToPublish) {
    publish (packageToPublish, unpmService.config.host.hostname, unpmService.config.host.port);
  },
  function (err) {
	unpmService.server.close ();
  });
}







