'use strict';

var moduleName = 'prepeon';

module.exports = function(packagePath, sharePath, packageDef, response) {
  var xLog = require('xcraft-core-log')(moduleName, response);

  var xcraftInstall = function(callback) {
    var xPlatform = require('xcraft-core-platform');
    var xProcess = require('xcraft-core-process')({
      logger: 'xlog',
      resp: response,
    });

    /* prefix to /usr/share */
    var nodeModules = sharePath;

    xLog.info('prepeon for xcraft modules installation');

    var xcraft = 'npm' + xPlatform.getCmdExt();
    var args = ['--production', 'install'];

    xLog.verb(`${xcraft} ${args.join(' ')}`);

    xProcess.spawn(xcraft, args, {cwd: nodeModules}, callback);
  };

  return {
    run: function(callback) {
      xcraftInstall(callback);
    },
  };
};
