'use strict';

var moduleName = 'cmake';

var path        = require ('path');
var fs          = require ('fs');
var async       = require ('async');
var zogProcess  = require ('xcraft-core-process');
var zogConfig   = require ('./zogConfig.js') ();
var zogPlatform = require ('xcraft-core-platform');
var zogLog      = require ('xcraft-core-log') (moduleName);
var busClient   = require ('xcraft-core-busclient');

var pkgConfig = JSON.parse (fs.readFileSync (path.join (zogConfig.pkgBaseRoot, moduleName, 'config.json')));
var cmd = {};


/* TODO: must be generic. */
var makeRun = function (callback) {
  zogLog.info ('begin building of cmake');

  var os = require ('os');
  var args = [
    'all',
    'install'
  ];

  /* Force 1 on Windows because sometimes it fails with the depends. */
  args.unshift ('-j', zogPlatform.getOs () !== 'win' ? os.cpus ().length : '1');

  zogProcess.spawn ('make', args, function (done) {
    if (done) {
      zogLog.info ('cmake is built and installed');
    }

    callback (done ? null : 'make failed');
  }, function (line) {
    zogLog.verb (line);
  }, function (line) {
    zogLog.warn (line);
  });
};

/* TODO: must be generic. */
var bootstrapRun = function (cmakeDir, callback) {
  /* FIXME, TODO: use a backend (a module) for building cmake. */
  /* bootstrap --prefix=/mingw && make && make install */

  var args = [
    'bootstrap',
    '--prefix=' + path.resolve (pkgConfig.out)
  ];

  process.chdir (cmakeDir);
  zogProcess.spawn ('sh', args, function (done) {
    callback (done ? null : 'bootstrap failed');
  }, function (line) {
    zogLog.verb (line);
  }, function (line) {
    zogLog.warn (line);
  });
};

/**
 * Install the cmake package.
 */
cmd.install = function () {
  var archive = path.basename (pkgConfig.src);
  var inputFile  = pkgConfig.src;
  var outputFile = path.join (zogConfig.tempRoot, 'src', archive);

  async.auto (
  {
    taskHttp: function (callback) {
      var zogHttp = require ('xcraft-core-http');

      zogHttp.get (inputFile, outputFile, function () {
        callback ();
      });
    },

    taskExtract: ['taskHttp', function (callback) {
      var zogExtract = require ('xcraft-core-extract');
      var outDir = path.dirname (outputFile);

      zogExtract.targz (outputFile, outDir, null, function (done) {
        callback (done ? null : 'extract failed', path.join (outDir, path.basename (outputFile, '.tar.gz')));
      });
    }],

    taskBootstrap: ['taskExtract', function (callback, results) {
      bootstrapRun (results.taskExtract, callback);
    }],

    taskMake: ['taskBootstrap', makeRun]
  }, function (err) {
    if (err) {
      zogLog.err (err);
    }

    busClient.events.send ('zogCMake.install.finished');
  });
};

/**
 * Uninstall the cmake package.
 */
cmd.uninstall = function () {
  zogLog.warn ('the uninstall action is not implemented');
  busClient.events.send ('zogCMake.uninstall.finished');
};

/**
 * Retrieve the list of available commands.
 * @returns {Object[]} The list of commands.
 */
exports.busCommands = function () {
  var list = [];

  Object.keys (cmd).forEach (function (action) {
    list.push ({
      name   : action,
      desc   : '',
      handler: cmd[action]
    });
  });

  return list;
};
