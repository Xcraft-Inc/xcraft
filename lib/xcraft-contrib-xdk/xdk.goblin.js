'use strict';

var path = require ('path');

var fs = require ('fs');
var xFs = require ('xcraft-core-fs');
var busClient = require ('xcraft-core-busclient').getGlobal ();
var config = require ('xcraft-core-etc') ().load ('xcraft-contrib-xdk');
var xConf = require ('xcraft-core-etc') ().load ('xcraft');
var unpmConf = require ('xcraft-core-etc') ().load ('unpm');
var xPlatform = require ('xcraft-core-platform');
var async = require ('async');

var cmd = {};

/**
 * Build a gadget from /home/xdk/ for testing.
 *
 * @param {Object} cmd - gadgetName
 */
cmd.build = function (cmd, response) {
  var gadgetName = cmd.data.gadgetName;
  var gadgetPath = path.join (config.home, gadgetName);
  if (!fs.existsSync (gadgetPath)) {
    busClient.events.send ('xdk.goblin.build.finished');
    response.log.err (
      'Unable to build gadget ' + gadgetName + ' , not found in: ' + config.home
    );
    return;
  }

  var oldPath = process.cwd ();
  response.log.info ('xdk goblin in ' + config.home);

  var xcraftCmd = 'xcraft' + xPlatform.getCmdExt ();
  var installCmd = 'npm' + xPlatform.getCmdExt ();
  var registryArg =
    unpmConf.host.protocol +
    '://' +
    unpmConf.host.hostname +
    ':' +
    unpmConf.host.port;

  const xProcess = require ('xcraft-core-process') ({
    logger: 'xlog',
    resp: response,
  });

  async.series (
    {
      clean: function (callback) {
        process.chdir (gadgetPath);
        response.log.info ('xdk goblin in ' + gadgetPath);
        var gadgetModules = path.join ('.', '/node_modules/');
        response.log.info ('lookin for ' + gadgetModules);
        if (fs.existsSync (gadgetModules)) {
          response.log.info ('xdk goblin cleaning ' + gadgetModules);
          xFs.rm (gadgetModules);
        }
        callback ();
      },

      unpmStart: function (callback) {
        process.chdir (oldPath);
        xProcess.spawn (xcraftCmd, ['unpm', 'start'], {}, callback);
      },

      install: function (callback) {
        process.chdir (gadgetPath);
        xProcess.spawn (
          installCmd,
          ['install', '.', '--registry', registryArg],
          {},
          callback
        );
      },

      unpmStop: function (callback) {
        process.chdir (oldPath);
        xProcess.spawn (xcraftCmd, ['unpm', 'stop'], {}, callback);
      },
    },
    function (err) {
      if (err) {
        response.log.err (err);
      }

      busClient.events.send ('xdk.goblin.build.finished');
    }
  );
};

/**
 * Craft a gadget with materials; use generator.
 *
 * @param {Object} cmd - gadgetName
 */
cmd.craft = function (cmd, response) {
  var gadgetName = cmd.data.gadgetName;
  var gadgetPath = path.join (config.home, gadgetName);
  var oldPath = process.cwd ();

  response.log.info ('using ' + config.home);
  response.log.info (gadgetName);

  var xcraftCmd = 'xcraft' + xPlatform.getCmdExt ();

  const xProcess = require ('xcraft-core-process') ({
    logger: 'xlog',
    resp: response,
  });

  async.series (
    {
      unpm: function (callback) {
        xProcess.spawn (xcraftCmd, ['unpm', 'start'], {}, callback);
      },

      craft: function (callback) {
        xFs.mkdir (gadgetPath);
        process.chdir (gadgetPath);
        response.log.info ('TODO: craft code here' + gadgetPath);
        callback ();
      },
    },
    function (err) {
      if (err) {
        response.log.err (err);
      }

      process.chdir (oldPath);
      busClient.events.send ('xdk.goblin.craft.finished');
    }
  );
};

/**
* Dig for available gagdgets in /home/xdk
* (gadget list).
*
*/
cmd.digin = function () {
  var xFs = require ('xcraft-core-fs');
  var path = require ('path');
  var xdkHome = path.join (xConf.xcraftRoot, config.home);

  var filterRegex = /^gadget\.js$/;
  var gadgetList = [];
  var gadgetDirs = xFs.lsdir (path.resolve (xdkHome));

  gadgetDirs.forEach (function (gadgetDir) {
    var gadgetPath = path.join (xdkHome, gadgetDir);
    var gadgetRcFiles = xFs.ls (gadgetPath, filterRegex);

    gadgetRcFiles.forEach (function (fileName) {
      var gadgetRc = require (path.join (gadgetPath, fileName));
      gadgetList.push (gadgetRc);
    });
  });

  busClient.events.send ('xdk.goblin.gadget.list', gadgetList);
  busClient.events.send ('xdk.goblin.digin.finished');
};

/**
* Run installed gobelin env.
* (from devroot).
*/
cmd.run = function (msg, response) {
  var rootPath = path.join (xConf.pkgTargetRoot, xPlatform.getToolchainArch ());
  var goblinPath = path.join (rootPath, '/usr/share/toolchain/xcraft-goblin/');
  var xatomCmd = 'xcraft-atom' + xPlatform.getCmdExt ();

  const xProcess = require ('xcraft-core-process') ({
    logger: 'xlog',
    resp: response,
  });

  xProcess.spawn (xatomCmd, [goblinPath], {}, function (err) {
    if (err) {
      response.log.err (err);
    }

    busClient.events.send ('xdk.goblin.run.finished');
  });
};

/**
* Run development gobelin env.
* (from /home/xdk).
*/
cmd.test = function (msg, response) {
  var devGoblinPath = path.join (
    xConf.xcraftRoot,
    config.home,
    'xcraft-goblin'
  );

  response.log.info ('xdk test goblin is in ' + devGoblinPath);
  var xatomCmd = 'xcraft-atom' + xPlatform.getCmdExt ();

  const xProcess = require ('xcraft-core-process') ({
    logger: 'xlog',
    resp: response,
  });

  xProcess.spawn (xatomCmd, [devGoblinPath], {}, function (err) {
    if (err) {
      response.log.err (err);
    }

    busClient.events.send ('xdk.goblin.test.finished');
  });
};

/**
 * Install devroot packages:
 *
 * toolchain+xcraft-atom
 * toolchain+xcraft-goblin
 * toolchain+xcraft-gui
 */
cmd.install = function () {
  var packages = [
    'toolchain+xcraft-peon',
    'toolchain+xcraft-atom',
    'toolchain+xcraft-goblin',
    'toolchain+xcraft-gui',
  ];

  var installGoblin = function (callback) {
    busClient.events.subscribe ('pacman.install.finished', function () {
      busClient.events.unsubscribe ('pacman.install.finished');
      callback ();
    });

    var msg = {
      packageRefs: 'toolchain+xcraft-goblin:' + xPlatform.getToolchainArch (),
    };

    busClient.command.send ('pacman.install', msg);
  };

  var installGui = function (callback) {
    busClient.events.subscribe ('pacman.install.finished', function () {
      busClient.events.unsubscribe ('pacman.install.finished');
      callback ();
    });

    var msg = {
      packageRefs: 'toolchain+xcraft-gui:' + xPlatform.getToolchainArch (),
    };

    busClient.command.send ('pacman.install', msg);
  };

  async.eachSeries (
    packages,
    function (pkg, callback) {
      busClient.events.subscribe ('pacman.make.finished', function () {
        busClient.events.unsubscribe ('pacman.make.finished');
        callback ();
      });

      var msg = {
        packageArgs: [pkg],
      };

      busClient.command.send ('pacman.make', msg);
    },
    function () {
      installGoblin (function () {
        installGui (function () {
          busClient.events.send ('xdk.goblin.install.finished');
        });
      });
    }
  );
};

/**
 * Retrieve the list of available commands.
 *
 * @returns {Object} The list and definitions of commands.
 */
exports.xcraftCommands = function () {
  return {
    handlers: cmd,
    rc: {
      test: {
        desc: 'start /home/xdk dev goblin',
        options: {
          scope: 'goblin',
        },
      },
      build: {
        desc: 'build a goblin gadget in /home/xdk',
        options: {
          scope: 'goblin',
          params: {
            required: 'gadgetName',
          },
        },
      },
      craft: {
        desc: 'craft a goblin gadget in /home/xdk',
        options: {
          scope: 'goblin',
          params: {
            required: 'gadgetName',
          },
        },
      },
      digin: {
        desc: 'Search for goblin gadgets in /home/xdk',
        options: {
          scope: 'goblin',
        },
      },
      install: {
        desc: 'install goblin environnement in devroot',
        options: {
          scope: 'goblin',
        },
      },
      run: {
        desc: 'start goblin desktop',
        options: {
          scope: 'goblin',
          params: {
            optional: 'gadgetName',
          },
        },
      },
    },
  };
};
