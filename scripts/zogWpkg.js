'use strict';

var moduleName = 'wpkg';

var path        = require ('path');
var fs          = require ('fs');
var async       = require ('async');
var zogProcess  = require ('xcraft-core-process');
var zogConfig   = require ('./zogConfig.js') ();
var zogPlatform = require ('xcraft-core-platform');
var zogLog      = require ('xcraft-core-log') (moduleName);
var zogFs       = require ('xcraft-core-fs');
var busClient   = require ('xcraft-core-busclient');

var pkgConfig = JSON.parse (fs.readFileSync (path.join (zogConfig.pkgBaseRoot,
                                                        moduleName,
                                                        'config.json')));
var cmd = {};


/* TODO: must be generic. */
var makeRun = function (callback) {
  zogLog.info ('begin building of wpkg');

  var os = require ('os');
  var args =
  [
    'all',
    'install'
  ];

  /* Force 1 on Windows because sometimes it fails with the depends. */
  args.unshift ('-j', zogPlatform.getOs () !== 'win' ? os.cpus ().length : '1');

  var makeBin = 'make';
  zogProcess.spawn (makeBin, args, function (done) {
    if (done) {
      zogLog.info ('wpkg is built and installed');
    }

    callback (done ? null : 'make failed');
  }, function (line) {
    zogLog.verb (line);
  }, function (line) {
    zogLog.warn (line);
  });
};

/* TODO: must be generic. */
var cmakeRun = function (srcDir, callback) {
  /* FIXME, TODO: use a backend (a module) for building with cmake. */
  /* cmake -DCMAKE_INSTALL_PREFIX:PATH=/usr . && make all install */

  var buildDir = path.join (srcDir, '..', 'BUILD');
  zogFs.mkdir (buildDir);

  var args =
  [
    '-DCMAKE_INSTALL_PREFIX:PATH=' + path.resolve (pkgConfig.out),
    srcDir
  ];

  if (zogPlatform.getOs () === 'win') {
    args.unshift ('-G', 'MSYS Makefiles');
  }

  process.chdir (buildDir);
  zogProcess.spawn ('cmake', args, function (done) {
    callback (done ? null : 'cmake failed');
  }, function (line) {
    zogLog.verb (line);
  }, function (line) {
    zogLog.warn (line);
  });
};

var patchRun = function (srcDir, callback) {
  var zogDevel = require ('zogDevel');
  var async    = require ('async');

  var os = zogPlatform.getOs ();

  var patchDir = path.join (zogConfig.pkgBaseRoot, moduleName, 'patch');
  var list = zogFs.ls (patchDir, new RegExp ('^([0-9]+|' + os + '-).*.patch$'));

  if (!list.length) {
    callback ();
    return;
  }

  async.eachSeries (list, function (file, callback) {
    zogLog.info ('apply patch: ' + file);
    var patchFile = path.join (patchDir, file);

    zogDevel.patch (srcDir, patchFile, 2, function (done) {
      callback (done ? null : 'patch failed: ' + file);
    });
  }, function (err) {
    callback (err);
  });
};

/**
 * Install the wpkg package.
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

      /* HACK: a very long filename exists in the tarball, then it is a
       *       problem for node.js and the 260 chars limitation.
       */
      zogExtract.targz (outputFile, outDir, /very-very-very-long/, function (done) {
        var srcDir = path.join (zogConfig.tempRoot,
                                'src',
                                pkgConfig.name + '_' + pkgConfig.version);
        callback (done ? null : 'extract failed', srcDir);
      });
    }],

    taskPatch: ['taskExtract', function (callback, results) {
      patchRun (results.taskExtract, callback);
    }],

    taskCMake: ['taskPatch', function (callback, results) {
      cmakeRun (results.taskExtract, callback);
    }],

    taskMake: ['taskCMake', makeRun]
  }, function (err) {
    if (err) {
      zogLog.err (err);
    }

    busClient.events.send ('zogWpkg.install.finished');
  });
};

/**
 * Uninstall the wpkg package.
 */
cmd.uninstall = function () {
  zogLog.warn ('the uninstall action is not implemented');
  busClient.events.send ('zogWpkg.uninstall.finished');
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
