'use strict';

var moduleName = 'xcraft';
var fs    = require ('fs');
var path  = require ('path');
var spawn = require ('child_process').spawn;

var inquirer = require ('inquirer');
var program  = require ('commander');


var startUNPMService = function () {
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
};

var inquire = function (fct) {
  var async = require ('async');

  var args = [];
  console.log ('[' + moduleName + '] Info: welcome to the arg console. Type <start> to start processing the arguments');

  async.forever(
    function (next) {
      var question = {
        type: 'input',
        name: 'arg',
        message: 'zog:arg>'
      };

      inquirer.prompt ([question], function (answers) {
        if (answers.arg === 'start') {
          next (1);
        } else {
          if (answers.arg.length > 0) {
            args.push (answers.arg);
          }
          next ();
        }
      });
    },
    function (err) {
      if (args.length > 0) {
        console.log ('[' + moduleName + '] Info: start processing');
        fct (args);
      }
    }
  );
};

var install = function (packages, useLocalRegistry, hostname, port, callback) {
  console.log ('[' + moduleName + '] Info: install dependencies');

  try {
    var ext = /^win/.test (process.platform) ? '.cmd' : '';
    var npm = '.npm' + ext;
    var args = ['install'];


    if (useLocalRegistry) {
      args.push ('--registry');
      args.push ('http://' + hostname + ':' + port);
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

    installCmd.on ('close', function (code) { /* jshint ignore:line */
      if (callback) {
        callback ();
      }
    });
  } catch (err) {
    console.log ('[' + moduleName + '] Err: ' + err);
  }
};

var publish = function (packageToPublish, hostname, port, callback) {
  console.log ('[' + moduleName + '] Info: publish ' + packageToPublish + ' in NPM');

  try {
    var ext = /^win/.test (process.platform) ? '.cmd' : '';
    var npm = '.npm' + ext;

    var args = ['--registry', 'http://' + hostname + ':' + port, 'publish'];

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

    publishCmd.on ('close', function (code) { /* jshint ignore:line */
      if (callback) {
        callback ();
      }
    });
  } catch (err) {
    console.log ('[' + moduleName + '] Err: ' + err);
  }
};

var createConfig = function (paths) {
  var root       = path.resolve ('./');

  var config = {
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
    path             : []
  };

  paths.forEach (function (p) {
    config.path.push (path.resolve (p));
  });

  return config;
};

var init = function (paths) {
  var dir      = path.resolve ('./etc/xcraft/');
  var fileName = path.join (dir, 'config.json');

  if (!fs.existsSync(dir)) {
    fs.mkdirSync (dir);
  }

  fs.writeFileSync (fileName, JSON.stringify (createConfig (paths), null, '  '));
};

var deploy = function (unpmNetworkConf) {
  var configFile = path.resolve ('./etc/unpm/config.json');
  var config     = JSON.parse (fs.readFileSync (configFile, 'utf8'));
  var unpmNetworkConfArray = unpmNetworkConf.split (',');

  config.host.hostname = unpmNetworkConfArray[0];
  config.host.port     = unpmNetworkConfArray[1];

  fs.writeFileSync (configFile, JSON.stringify (config, null, '  '));
};

var safeConfigure = function (modules) {
  var xEtc = require ('xcraft-core-etc');

  if (modules.length > 0 && modules[0] === 'all') {
    console.log ('[' + moduleName + '] Info: configuring all modules');
    xEtc.createAll (path.resolve ('./node_modules/'), /^xcraft-(core|contrib)/);
  } else {
    modules.forEach (function (mod) {
      console.log ('[' + moduleName + '] Info: configuring xcraft-' + mod);
      xEtc.createAll (path.resolve ('./node_modules/'), '/^xcraft-' + mod + '/');
    });
  }
}

var configure = function (modules) {
  try {
    require.resolve ('xcraft-core-etc');
    safeConfigure (modules);
  } catch (e) {
    var unpmService = startUNPMService ();

    install (['xcraft-core-etc'], true, unpmService.config.host.hostname, unpmService.config.host.port, function () {
      unpmService.server.close ();
      safeConfigure (modules);
    });
  }
};

var verify = function () {
  var packages = fs.readdirSync ('./lib/');

  packages.forEach (function (p) {
    var libVersionStr = JSON.parse (fs.readFileSync(path.resolve ('./lib/', p, 'package.json'), 'utf8')).version;
    var installedVersionStr = JSON.parse (fs.readFileSync(path.resolve ('./node_modules/', p, 'package.json'), 'utf8')).version;
    var libVersion = libVersionStr.split ('.');
    var installedVersion = installedVersionStr.split ('.');

    if (parseInt(libVersion[0]) > parseInt(installedVersion[0]) ||
        parseInt(libVersion[1]) > parseInt(installedVersion[1]) ||
        parseInt(libVersion[2]) > parseInt(installedVersion[2])) {
      console.log ('[' + moduleName + '] Warning: installed version of ' + p + ' is outdated (' + libVersionStr + ' > ' + installedVersionStr + ')');
    }
  });
};

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
    inquire (install);
  } else {
    install (program.prepare.split(','), false, '', '', function () {});
  }
}

if (program.init) {
  if (program.init === true) {
    inquire (init);
  } else {
    init (program.init.split(','));
  }
}

if (program.configure) {
  if (program.configure === true) {
    inquire (configure);
  } else {
    configure ( program.configure.split(','));
  }
}

if (program.install) {
  var packages    = fs.readdirSync (path.resolve ('./lib/'));
  var unpmService = startUNPMService ();

  install (packages, true, unpmService.config.host.hostname, unpmService.config.host.port, function () {
    unpmService.server.close ();
  });
}


if (program.publish) {
  var unpmService = startUNPMService ();
  var async = require ('async');
  var packages = fs.readdirSync (path.resolve ('./lib/'));

  async.eachSeries (packages, function (packageToPublish, callback) {
    publish (packageToPublish, unpmService.config.host.hostname, unpmService.config.host.port, callback);
  },
  function (err) {
    unpmService.server.close ();
  });
}

if (program.verify) {
  verify ();
}
