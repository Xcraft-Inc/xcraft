'use strict';
var moduleName = 'xdk';

var path = require ('path');

var xLog      = require ('xcraft-core-log') (moduleName);
var fs        = require ('fs');
var xFs       = require ('xcraft-core-fs');
var busClient = require ('xcraft-core-busclient');
var config    = require ('xcraft-core-etc').load ('xcraft-contrib-xdk');
var xConf     = require ('xcraft-core-etc').load ('xcraft');
var unpmConf  = require ('xcraft-core-etc').load ('unpm');
var xProcess  = require ('xcraft-core-process');
var xPlatform = require ('xcraft-core-platform');
var async     = require ('async');
var cmd = {};


/**
 * Build a gadget from /home/xdk/
 * for testing!
 * @param {Object} cmd - gadgetName
 */
cmd.build = function (cmd) {
  var gadgetName = cmd.data.gadgetName;
  var gadgetPath = path.join (config.home, gadgetName);
  if (!fs.existsSync (gadgetPath)) {
    busClient.events.send ('xdk.goblin.build.finished');
    xLog.err ('Unable to build gadget ' + gadgetName + ' , not found in: ' + config.home);
    return;
  }

  var oldPath    = process.cwd ();
  xLog.info ('xdk goblin in ' + config.home);

  var xcraftCmd   = 'xcraft' + xPlatform.getCmdExt ();
  var installCmd  = 'npm' + xPlatform.getCmdExt ();
  var registryArg = unpmConf.host.protocol + '://' +
                    unpmConf.host.hostname + ':' +
                    unpmConf.host.port;
  async.series ({
    clean: function (callback) {
      process.chdir (gadgetPath);
      xLog.info ('xdk goblin in ' + gadgetPath);
      var gadgetModules = path.join ('.', '/node_modules/');
      xLog.info ('lookin for ' + gadgetModules);
      if (fs.existsSync (gadgetModules)) {
        xLog.info ('xdk goblin cleaning ' + gadgetModules);
        xFs.rm (gadgetModules);
      }
      callback ();
    },
    unpmStart: function (callback) {
      process.chdir (oldPath);
      xProcess.spawn (xcraftCmd, ['unpm', 'start'], {}, function () {
        callback ();
      });
    },
    install: function (callback) {
      process.chdir (gadgetPath);
      xProcess.spawn (installCmd, ['install', '.', '--registry', registryArg], {}, function () {
        callback ();
      });
    },
    unpmStop: function (callback) {
      process.chdir (oldPath);
      xProcess.spawn (xcraftCmd, ['unpm', 'stop'], {}, function () {
        callback ();
      });
    },
  },
  function () {
    busClient.events.send ('xdk.goblin.build.finished');
  });
};

/**
 * Craft a gadget with materials
 * (use generator)
 *
 * @param {Object} cmd - gadgetName
 */
cmd.craft = function (cmd) {
  var gadgetName = cmd.data.gadgetName;
  var gadgetPath = path.join (config.home, gadgetName);
  var oldPath    = process.cwd ();

  xLog.info ('using ' + config.home);
  xLog.info (gadgetName);

  var xcraftCmd = 'xcraft' + xPlatform.getCmdExt ();
  var yoCmd     = 'yo' + xPlatform.getCmdExt ();

  async.series ({
    unpm: function (callback) {
      xProcess.spawn (xcraftCmd, ['unpm', 'start'], {}, function () {
        callback ();
      });
    },
    yo: function (callback) {
      xFs.mkdir (gadgetPath);
      process.chdir (gadgetPath);

      xLog.info ('yo in ' + gadgetPath);

      xProcess.spawn (yoCmd, ['xcraft:gadget'], {}, function () {
        callback ();
      });
    }
  },
  function () {
    process.chdir (oldPath);
    busClient.events.send ('xdk.goblin.craft.finished');
  });
};

/**
* Dig for available gagdgets in /home/xdk
* (gadget list)
*
*/
cmd.digin = function () {
  var xFs     = require ('xcraft-core-fs');
  var path    = require ('path');
  var xdkHome = path.join (xConf.xcraftRoot, config.home);
  var filterRegex  = /^gadget\.js$/;
  var gadgetList   = [];
  var gadgetDirs   = xFs.lsdir (path.resolve (xdkHome));
  gadgetDirs.forEach (function (gadgetDir) {
    var gadgetPath    = path.join (xdkHome, gadgetDir);
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
* (from devroot)
*/
cmd.run = function () {
  var rootPath   = path.join (xConf.pkgTargetRoot, xPlatform.getToolchainArch ());
  var goblinPath = path.join (rootPath, '/usr/share/toolchain/xcraft-goblin/');
  var xatomCmd = 'xcraft-atom' + xPlatform.getCmdExt ();

  xProcess.spawn (xatomCmd, [goblinPath], {}, function () {
    busClient.events.send ('xdk.goblin.run.finished');
  });
};

/**
* Run development gobelin env.
* (from /home/xdk)
*/
cmd.test = function () {
  var devGoblinPath = path.join (xConf.xcraftRoot, config.home, 'xcraft-goblin');
  xLog.info ('xdk test goblin is in ' + devGoblinPath);
  var xatomCmd = 'xcraft-atom' + xPlatform.getCmdExt ();
  xProcess.spawn (xatomCmd, [devGoblinPath], {}, function () {
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
    'bootstrap+xcraft-peon',
    'toolchain+xcraft-atom',
    'toolchain+xcraft-goblin',
    'toolchain+xcraft-gui'
  ];

  var installGoblin = function (callback) {
    busClient.events.subscribe ('pacman.install.finished', function () {
      busClient.events.unsubscribe ('pacman.install.finished');
      callback ();
    });

    var msg = {
      packageRef: 'toolchain+xcraft-goblin:' + xPlatform.getToolchainArch ()
    };

    busClient.command.send ('pacman.install', msg);
  };

  var installGui = function (callback) {
    busClient.events.subscribe ('pacman.install.finished', function () {
      busClient.events.unsubscribe ('pacman.install.finished');
      callback ();
    });

    var msg = {
      packageRef: 'toolchain+xcraft-gui:' + xPlatform.getToolchainArch ()
    };

    busClient.command.send ('pacman.install', msg);
  };

  async.eachSeries (packages , function (pkg, callback) {
    busClient.events.subscribe ('pacman.make.finished', function () {
      busClient.events.unsubscribe ('pacman.make.finished');
      callback ();
    });

    var msg = {
      packageRef: pkg
    };

    busClient.command.send ('pacman.make', msg);
  }, function () {
    installGoblin (function () {
      installGui (function () {
        busClient.events.send ('xdk.goblin.install.finished');
      });
    });
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
 * Retrieve the inquirer definition for xcraft-core-etc
 */
exports.xcraftConfig = [{
  type: 'input',
  name: 'home',
  message: 'XDK home folder:',
  default: './home/xdk/'
}];
