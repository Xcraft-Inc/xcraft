'use strict';

var path = require ('path');
var async = require ('async');

const xCMake = require ('xcraft-contrib-bootcmake');
const xPlatform = require ('xcraft-core-platform');
const xFs = require ('xcraft-core-fs');

var cmd = {};

/* TODO: must be generic. */
var makeRun = function (makeDir, response, callback) {
  const pkgConfig = require ('xcraft-core-etc') (null, response).load (
    'xcraft-contrib-bootwpkg'
  );

  response.log.info ('begin building of wpkg');

  var make = 'make';

  if (xPlatform.getOs () === 'win') {
    make = 'mingw32-make';
  }

  var os = require ('os');
  var list = ['all'];

  const xProcess = require ('xcraft-core-process') ({
    logger: 'xlog',
    parser: 'cmake',
    resp: response,
  });

  var currentDir = process.cwd ();
  process.chdir (makeDir);
  async.eachSeries (
    list,
    function (args, callback) {
      var fullArgs = ['-j' + os.cpus ().length].concat (args);

      xProcess.spawn (make, fullArgs, {}, function (err) {
        callback (err ? 'make failed: ' + err : null);
      });
    },
    function (err) {
      process.chdir (currentDir);

      if (!err) {
        xFs.cp (path.join (makeDir, 'dist/usr'), path.resolve (pkgConfig.out));
        response.log.info ('wpkg is built and installed');
      }

      callback (err ? 'make failed' : null);
    }
  );
};

/* TODO: must be generic. */
var cmakeRun = function (srcDir, response, callback) {
  /* FIXME, TODO: use a backend (a module) for building with cmake. */
  /* cmake -DCMAKE_INSTALL_PREFIX:PATH=/usr . && make all install */

  var buildDir = path.join (srcDir, '../BUILD_WPKG');
  xFs.mkdir (buildDir);

  var args = ['-DCMAKE_COLOR_MAKEFILE=OFF', '-DCMAKE_BUILD_TYPE=Release'];

  if (xPlatform.getOs () === 'win') {
    args.unshift ('-G', 'MinGW Makefiles');
  }

  args.push (srcDir);

  const xProcess = require ('xcraft-core-process') ({
    logger: 'xlog',
    parser: 'cmake',
    resp: response,
  });

  var currentDir = process.cwd ();
  process.chdir (buildDir);
  xProcess.spawn ('cmake', args, {}, function (err) {
    process.chdir (currentDir);
    callback (err ? 'cmake failed: ' + err : null);
  });
};

var patchRun = function (srcDir, response, callback) {
  var xDevel = require ('xcraft-core-devel');
  var async = require ('async');

  var os = xPlatform.getOs ();

  var patchDir = path.join (__dirname, 'patch');
  var list = xFs.ls (patchDir, new RegExp ('^([0-9]+|' + os + '-).*.patch$'));

  if (!list.length) {
    callback ();
    return;
  }

  async.eachSeries (
    list,
    function (file, callback) {
      response.log.info ('apply patch: ' + file);
      var patchFile = path.join (patchDir, file);

      xDevel.patch (srcDir, patchFile, 1, response, function (err) {
        callback (err ? 'patch failed: ' + file + ' ' + err : null);
      });
    },
    function (err) {
      callback (err);
    }
  );
};

/**
 * Build the wpkg package.
 */
cmd.build = function (msg, response) {
  const xcraftConfig = require ('xcraft-core-etc') (null, response).load (
    'xcraft'
  );
  const pkgConfig = require ('xcraft-core-etc') (null, response).load (
    'xcraft-contrib-bootwpkg'
  );
  var xEnv = require ('xcraft-core-env');

  var archive = path.basename (pkgConfig.src);
  var inputFile = pkgConfig.src;
  var outputFile = path.join (xcraftConfig.tempRoot, 'src', archive);

  async.auto (
    {
      taskHttp: function (callback) {
        var xHttp = require ('xcraft-core-http');

        xHttp.get (
          inputFile,
          outputFile,
          function () {
            callback ();
          },
          function (progress, total) {
            response.log.progress ('Downloading', progress, total);
          }
        );
      },

      taskExtract: [
        'taskHttp',
        function (callback) {
          var xExtract = require ('xcraft-core-extract');
          var outDir = path.dirname (outputFile);

          /* HACK: a very long filename exists in the tarball, then it is a
       *       problem for node.js and the 260 chars limitation.
       */
          xExtract.targz (
            outputFile,
            outDir,
            /very-very-very-long/,
            response,
            function (err) {
              var srcDir = path.join (
                xcraftConfig.tempRoot,
                'src',
                'unigw-cf58947c03a304e67a2f283ca1943d0ed3b898d5' /* pkgConfig.name + '-' + pkgConfig.version */
              );
              callback (err ? 'extract failed: ' + err : null, srcDir);
            },
            function (progress, total) {
              response.log.progress ('Extracting', progress, total);
            }
          );
        },
      ],

      taskPatch: [
        'taskExtract',
        function (callback, results) {
          patchRun (results.taskExtract, response, callback);
        },
      ],

      taskMSYS: [
        'taskPatch',
        function (callback) {
          if (xPlatform.getOs () === 'win') {
            callback (null, xCMake.stripShForMinGW ());
            return;
          }
          callback ();
        },
      ],

      taskCMake: [
        'taskMSYS',
        function (callback, results) {
          cmakeRun (results.taskExtract, response, callback);
        },
      ],

      taskMake: [
        'taskCMake',
        function (callback, results) {
          makeRun (
            path.join (results.taskExtract, '../BUILD_WPKG'),
            response,
            callback
          );
        },
      ],
    },
    function (err, results) {
      if (err) {
        response.log.err (err);
      }

      /* Restore MSYS path. */
      if (results.taskMSYS) {
        for (const p of results.taskMSYS) {
          xEnv.var.path.insert (p.index, p.location);
        }
      }

      response.events.send ('wpkg.build.finished');
    }
  );
};

/**
 * Retrieve the list of available commands.
 *
 * @returns {Object} The list and definitions of commands.
 */
exports.xcraftCommands = function () {
  const xUtils = require ('xcraft-core-utils');
  return {
    handlers: cmd,
    rc: xUtils.json.fromFile (path.join (__dirname, './rc.json')),
  };
};
