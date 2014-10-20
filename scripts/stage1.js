'use strict';

var moduleName = 'stage1';
var depsForZog = [
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

var corePackages = [
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
  'xcraft-core-server',
  'xcraft-contrib-chest',
  'xcraft-contrib-cmake',
  'xcraft-contrib-pacman',
  'xcraft-contrib-wpkg',
  'xcraft-contrib-lokthar',
  'xcraft-zog'
];

try {
  process.chdir (__dirname + '/..');
  console.log ('[' + moduleName + '] Info: go to the toolchain directory: ' + process.cwd ());
} catch (err) {
  console.log ('[' + moduleName + '] Err: ' + err);
}


/**
 * Create Xcraft base config
 */
var createConfig = function () {
  var path       = require ('path');
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
    binGrunt         : path.resolve (root, './node_modules/', 'grunt-cli/bin/grunt')
  };
};

var writeConfig  = function () {
  var fs         = require ('fs');
  var path       = require ('path');
  var dir  = path.resolve ('./etc/xcraft/');
  var fileName   = path.join (dir, 'config.json');

  if (!fs.existsSync(dir)) {
    fs.mkdirSync (dir);
  }

  fs.writeFileSync (fileName, JSON.stringify (createConfig (), null, '  '));
};

/**
 * Install packages
 */
var npmInstall = function (packages, useRegistry, stageCallback) {
  var spawn  = require ('child_process').spawn;
  console.log ('[' + moduleName + '] Info: install dependencies');

  try {
    var ext = /^win/.test (process.platform) ? '.cmd' : '';
    var npm = 'npm' + ext;
    var args = ['install'];

    if (useRegistry) {
      args.push ('--registry');
      args.push ('http://localhost:8485');
    }

    args = args.concat (packages);

    var install = spawn (npm, args);

    install.stdout.on ('data', function (data) {
      data.toString ().replace (/\r/g, '').split ('\n').forEach (function (line) {
        if (line.trim ().length) {
          console.log (line);
        }
      });
    });

    install.stderr.on ('data', function (data) {
      data.toString ().replace (/\r/g, '').split ('\n').forEach (function (line) {
        if (line.trim ().length) {
          console.log (line);
        }
      });
    });

    install.on ('close', function (code) { /* jshint ignore:line */
      if (stageCallback) {
        stageCallback ();
      }
    });
  } catch (err) {
    console.log ('[' + moduleName + '] Err: ' + err);
  }
};

/**
 * Publish packages
 */
var npmPublish = function (packageToPublish, callback) {
  var spawn  = require ('child_process').spawn;
  var path = require ('path');
  console.log ('[' + moduleName + '] Info: publish ' + packageToPublish + ' in µNPM');

  try {
    var ext = /^win/.test (process.platform) ? '.cmd' : '';
    var npm = 'npm' + ext;
    var args = ['--registry', 'http://localhost:8485', 'publish'];
    var packagePath = path.join ('lib/', packageToPublish);
    args.push (packagePath);

    var install = spawn (npm, args);

    install.stdout.on ('data', function (data) {
      data.toString ().replace (/\r/g, '').split ('\n').forEach (function (line) {
        if (line.trim ().length) {
          console.log (line);
        }
      });
    });

    install.stderr.on ('data', function (data) {
      data.toString ().replace (/\r/g, '').split ('\n').forEach (function (line) {
        if (line.trim ().length) {
          console.log (line);
        }
      });
    });

    install.on ('close', function (code) { /* jshint ignore:line */
      if (callback) {
        callback ();
      }
    });
  } catch (err) {
    console.log ('[' + moduleName + '] Err: ' + err);
  }
};

/**
 * The third stage installs cmake and wpkg.
 */
var stage3 = function (finishCallback) {
  console.log ('[' + moduleName + '] Info: end of stage one');

  var util = require ('util');
  var zogProcess  = require ('xcraft-core-process');
  var zogPlatform = require ('xcraft-core-platform');
  var zogLog      = require ('xcraft-core-log') ('stage3');
  var xcraftConfig  = require ('xcraft-core-etc').load ('xcraft');
  zogLog.verbosity (0);

  /* Locations of the sysroot/ binaries. */
  if (process.argv.length > 2) {
    var path      = require ('path');

    var list = [];

    process.argv.slice (2).forEach (function (location) {
      list.push (path.resolve (location));
    });

    var sysroot = list.shift ();
    var zogrc = {
      path: list,
      sysroot: sysroot
    };

    var fs = require ('fs');
    fs.writeFileSync (xcraftConfig.zogRc, JSON.stringify (zogrc, null, '  '));
  }

  var zog = util.format ('%szog%s',
                         zogPlatform.getOs () !== 'win' ? './' : '',
                         zogPlatform.getCmdExt ());

  var async = require ('async');

  async.eachSeries (['cmake', 'wpkg'], function (action, callback) {
    zogLog.info ('install %s', action);

    var args = [
      '-v0',
      action,
      'install'
    ];

    zogProcess.spawn (zog, args, function (done) {
      callback (done ? null : 'action ' + action + ' has failed');
    });
  },
  function (err) {
    if (err) {
      zogLog.err (err);
    }

    finishCallback();
  });
};

var stage2 = function () {
  var path    = require ('path');
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

  var async = require ('async');
  async.eachSeries (corePackages, function (packageToPublish, callback) {
    npmPublish (packageToPublish, callback);
  },
  function (err) {
    if (err) {
      console.log (err);
      unpmService.server.close ();
    } else {
      npmInstall (corePackages, true, function () {
        /* Configure the xCraft modules. */
        /* FIXME: the locations must be provided by the xcraft main config file.
         *        Currently it is zogConfig, but this one will be changed.
         */
        var xEtc = require ('xcraft-core-etc');
        xEtc.createAll (path.resolve ('./node_modules/'), /^xcraft-(core|contrib)/);

        stage3 (function () {
          unpmService.server.close ();
        });
      });
    }
  });
};

/**
 * Start here
 */

writeConfig ();
npmInstall (depsForZog, false, stage2);
