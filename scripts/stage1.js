'use strict';

var moduleName = 'stage1';

var zogPlatform = require ('zogPlatform');

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
  'socket.io',
  'socket.io-client',
  'tar',
  'tar.gz',
  'unpm',
  'unpm-fs-backend'
];

var corePackages = [
  'xcraft-core-fs',
  'xcraft-core-scm',
  'xcraft-core-peon',
  'xcraft-core-http',
  'xcraft-core-extract',
  'xcraft-core-log',
  'xcraft-core-process'
];

try {
  process.chdir (__dirname + '/..');
  console.log ('[' + moduleName + '] Info: go to the toolchain directory: ' + process.cwd ());
} catch (err) {
  console.log ('[' + moduleName + '] Err: ' + err);
}

/**
 * Install packages
 */
var npmInstall = function (packages, useRegistry, stageCallback) {
  var spawn  = require ('child_process').spawn;
  console.log ('[' + moduleName + '] Info: install dependencies');
  try {
    var npm = 'npm' + zogPlatform.getCmdExt ();
    var args = ['install'];

    if (useRegistry) {
      args.push ('--registry');
      args.push ('http://localhost:8485');
    }

    args = args.concat (packages);

    var install = spawn (npm, args);
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
var npmPublish = function (packageToPublish,  callback) {
  var spawn  = require ('child_process').spawn;
  console.log ('[' + moduleName + '] Info: publish '+ packageToPublish + ' in µNPM');
  try {
    var path = require ('path');
    var npm = 'npm' + zogPlatform.getCmdExt ();
    var args = ['--registry','http://localhost:8485','publish'];
    var packagePath = path.join ('lib/', packageToPublish);
    args.push (packagePath);

    var install = spawn (npm, args);
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
  var zogLog = require ('xcraft-core-log') ('stage3');
  zogLog.verbosity (0);

  /* Locations of the sysroot/ binaries. */
  if (process.argv.length > 2) {
    var path      = require ('path');
    var zogConfig = require ('./zogConfig.js') ();

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
    fs.writeFileSync (zogConfig.zogRc, JSON.stringify (zogrc, null, '  '));
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
  var dataDir = './usr/share/unpm';
  var config  = {
    configfile: './etc/unpm/unpm.json'
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
          stage3 (function () {
            unpmService.server.close ();
          });
        });
      }
    }
  );


};

/**
 * Start here
 */
npmInstall (depsForZog, false, stage2);
