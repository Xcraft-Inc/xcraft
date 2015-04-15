'use strict';

var moduleName = 'wpkg';

var path  = require ('path');
var async = require ('async');

var xPlatform    = require ('xcraft-core-platform');
var xLog         = require ('xcraft-core-log') (moduleName);
var xFs          = require ('xcraft-core-fs');
var busClient    = require ('xcraft-core-busclient');
var xcraftConfig = require ('xcraft-core-etc').load ('xcraft');
var pkgConfig    = require ('xcraft-core-etc').load ('xcraft-contrib-wpkg');
var xProcess     = require ('xcraft-core-process') ({
  logger: 'xlog',
  parser: 'cmake',
  mod:    moduleName,
  events: busClient.events
});

var cmd = {};


/* TODO: must be generic. */
var makeRun = function (makeDir, callback) {
  xLog.info ('begin building of wpkg');

  var make = 'make';

  if (xPlatform.getOs () === 'win') {
    make = 'mingw32-make';
  }

  var os = require ('os');
  var list = [
    'all',
    'install'
  ];

  var currentDir = process.cwd ();
  process.chdir (makeDir);
  async.eachSeries (list, function (args, callback) {
    var fullArgs = ['-j' + os.cpus ().length].concat (args);

    xProcess.spawn (make, fullArgs, {}, function (err) {
      callback (err ? 'make failed: ' + err : null);
    });
  }, function (err) {
    if (!err) {
      xLog.info ('wpkg is built and installed');
    }

    process.chdir (currentDir);
    callback (err ? 'make failed' : null);
  });
};

/* TODO: must be generic. */
var cmakeRun = function (srcDir, callback) {
  /* FIXME, TODO: use a backend (a module) for building with cmake. */
  /* cmake -DCMAKE_INSTALL_PREFIX:PATH=/usr . && make all install */

  var buildDir = path.join (srcDir, '../BUILD_WPKG');
  xFs.mkdir (buildDir);

  var args = [
    '-DCMAKE_COLOR_MAKEFILE=OFF',
    '-DCMAKE_BUILD_TYPE=Release',
    '-DCMAKE_INSTALL_PREFIX:PATH=' + path.resolve (pkgConfig.out),
    srcDir
  ];

  if (xPlatform.getOs () === 'win') {
    args.unshift ('-G', 'MinGW Makefiles');
  }

  var currentDir = process.cwd ();
  process.chdir (buildDir);
  xProcess.spawn ('cmake', args, {}, function (err) {
    process.chdir (currentDir);
    callback (err ? 'cmake failed: ' + err : null);
  });
};

var patchRun = function (srcDir, callback) {
  var xDevel = require ('xcraft-core-devel');
  var async  = require ('async');

  var os = xPlatform.getOs ();

  var patchDir = path.join (__dirname, 'patch');
  var list = xFs.ls (patchDir, new RegExp ('^([0-9]+|' + os + '-).*.patch$'));

  if (!list.length) {
    callback ();
    return;
  }

  async.eachSeries (list, function (file, callback) {
    xLog.info ('apply patch: ' + file);
    var patchFile = path.join (patchDir, file);

    xDevel.patch (srcDir, patchFile, 2, function (err) {
      callback (err ? 'patch failed: ' + file + ' ' + err : null);
    });
  }, function (err) {
    callback (err);
  });
};

/**
 * Build the wpkg package.
 */
cmd.build = function () {
  var xPath = require ('xcraft-core-path');

  var archive = path.basename (pkgConfig.src);
  var inputFile  = pkgConfig.src;
  var outputFile = path.join (xcraftConfig.tempRoot, 'src', archive);

  async.auto ({
    taskHttp: function (callback) {
      var xHttp = require ('xcraft-core-http');

      xHttp.get (inputFile, outputFile, function () {
        callback ();
      });
    },

    taskExtract: ['taskHttp', function (callback) {
      var xExtract = require ('xcraft-core-extract');
      var outDir = path.dirname (outputFile);

      /* HACK: a very long filename exists in the tarball, then it is a
       *       problem for node.js and the 260 chars limitation.
       */
      xExtract.targz (outputFile, outDir, /very-very-very-long/, function (err) {
        var srcDir = path.join (xcraftConfig.tempRoot,
                                'src',
                                pkgConfig.name + '_' + pkgConfig.version);
        callback (err ? 'extract failed: ' + err : null, srcDir);
      });
    }],

    taskPatch: ['taskExtract', function (callback, results) {
      patchRun (results.taskExtract, callback);
    }],

    taskMSYS: ['taskPatch', function (callback) {
      if (xPlatform.getOs () === 'win') {
        /* Strip MSYS from the PATH. */
        var sh = xPath.isIn ('sh.exe');
        if (sh) {
          callback (null, {
            index:    sh.index,
            location: xPath.strip (sh.index)
          });
          return;
        }
      }
      callback ();
    }],

    taskCMake: ['taskMSYS', function (callback, results) {
      cmakeRun (results.taskExtract, callback);
    }],

    taskMake: ['taskCMake', function (callback, results) {
      makeRun (path.join (results.taskExtract, '../BUILD_WPKG'), callback);
    }]
  }, function (err, results) {
    if (err) {
      xLog.err (err);
    }

    /* Restore MSYS path. */
    if (results.taskMSYS) {
      xPath.insert (results.taskMSYS.index, results.taskMSYS.location);
    }

    busClient.events.send ('wpkg.build.finished');
  });
};

/**
 * Retrieve the list of available commands.
 *
 * @returns {Object} The list and definitions of commands.
 */
exports.xcraftCommands = function () {
  return {
    handlers: cmd,
    rc: path.join (__dirname, './rc.json')
  };
};

/**
 * Retrieve the inquirer definition for xcraft-core-etc.
 */
exports.xcraftConfig = [{
  type: 'input',
  name: 'name',
  message: 'package name',
  default: 'wpkg'
}, {
  type: 'input',
  name: 'version',
  message: 'version',
  default: '0.9.8-pre'
}, {
  type: 'input',
  name: 'src',
  message: 'source URI',
  default: 'https://wpkg.epsitec.ch/resources/wpkg_0.9.8-pre.tar.gz'
}, {
  type: 'input',
  name: 'out',
  message: 'output directory',
  default: './usr'
}];
