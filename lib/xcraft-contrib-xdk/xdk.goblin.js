'use strict';
var moduleName = 'xdk';

var path = require('path');

var xLog      = require ('xcraft-core-log') (moduleName);
var xFs       = require ('xcraft-core-fs');
var busClient = require ('xcraft-core-busclient');
var config    = require ('xcraft-core-etc').load ('xcraft-contrib-xdk');
var xConf     = require ('xcraft-core-etc').load ('xcraft');
var xProcess  = require ('xcraft-core-process');
var xPlatform = require ('xcraft-core-platform');
var async     = require ('async');
var cmd = {};

/**
 * Craft a gadget with materials
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
      xProcess.spawn (xcraftCmd, ['unpm', 'start'], function () {
        callback ();
      });
    },
    yo: function (callback) {
      xFs.mkdir (gadgetPath);
      process.chdir (gadgetPath);

      xLog.info ('yo in ' + gadgetPath);

      xProcess.spawn (yoCmd, ['xcraft:gadget'], function () {
        callback ();
      });
    }
  },
  function () {
    process.chdir (oldPath);
    busClient.events.send ('xdk.goblin.craft.finished');
  });
};

cmd.digin = function () {
  var xFs     = require ('xcraft-core-fs');
  var path    = require ('path');
  var xdkHome = path.join (xConf.xcraftRoot, config.home);
  var filterRegex  = /^gadget\.js$/;
  var gadgetList   = [];
  var gadgetDirs   = xFs.lsdir (path.resolve (xdkHome));
  gadgetDirs.forEach (function (gadgetDir) {
    var gadgetPath    = path.join (xdkHome, gadgetDir)
    var gadgetRcFiles = xFs.ls (gadgetPath, filterRegex);
    goblinRcFiles.forEach (function (fileName) {
      var gadgetRc = require (path.join (gadgetPath, fileName));
      gadgetList.push (gadgetRc);
    });
  });
  busClient.events.send ('xdk.goblin.gadget.list', gadgetList);
  busClient.events.send ('xdk.goblin.digin.finished');
};

cmd.run = function () {
  var rootPath   = path.join (xconf.pkgTargetRoot, xPlatform.getToolchainArch ());
  var goblinPath = path.join (rootPath, '/usr/share/toolchain/xcraft-goblin/');
  var xatomCmd = 'xcraft-atom' + xPlatform.getCmdExt ();

  xProcess.spawn (xatomCmd, [goblinPath], function () {
    busClient.events.send ('xdk.goblin.run.finished');
  });
};

cmd.test = function () {
  var devGoblinPath = path.join (xConf.xcraftRoot, config.home, 'xcraft-goblin');
  var xatomCmd = 'xcraft-atom' + xPlatform.getCmdExt ();

  xProcess.spawn (xatomCmd, [devGoblinPath], function () {
    busClient.events.send ('xdk.goblin.test.finished');
  });
};

/**
 * Install devEnv packages:
 *
 * toolchain+xcraft-atom
 * toolchain+xcraft-goblin
 */
cmd.install = function () {
  var packages = [
    'toolchain+xcraft-peon',
    'toolchain+xcraft-atom',
    'toolchain+xcraft-goblin'
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

  async.eachSeries (packages , function (pkg, callback) {
    busClient.events.subscribe ('pacman.make.finished', function () {
      busClient.events.unsubscribe ('pacman.make.finished');
      callback ();
    });

    var msg = {
      packageName: pkg
    };

    busClient.command.send ('pacman.make', msg);
  }, function () {
    installGoblin (function () {
      busClient.events.send ('xdk.goblin.install.finished');
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
