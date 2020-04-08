'use strict';

var moduleName = 'postpeon';

module.exports = function (packagePath, sharePath, packageDef, resp) {
  var xLog = require('xcraft-core-log')(moduleName, resp);

  var xcraftInstall = function (callback) {
    var xPlatform = require('xcraft-core-platform');
    var xProcess = require('xcraft-core-process')({
      logger: 'xlog',
      resp,
    });

    /* prefix to /usr/share */
    var nodeModules = sharePath;

    xLog.info(`${moduleName} for xcraft modules installation`);

    var xcraft = 'npm' + xPlatform.getCmdExt();
    var args = ['--production', 'install'];

    xLog.verb(`${xcraft} ${args.join(' ')}`);

    xProcess.spawn(xcraft, args, {cwd: nodeModules}, callback);
  };

  return {
    run: function (callback) {
      xcraftInstall(callback);
    },
  };
};
