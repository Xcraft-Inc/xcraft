'use strict';

var moduleName = 'prepeon';

module.exports = function (packagePath, sharePath, packageDef, response) {
  var xLog = require ('xcraft-core-log') (moduleName, null);

  var xcraftInstall = function (callback) {
    var xPlatform = require ('xcraft-core-platform');
    var xProcess  = require ('xcraft-core-process') ({
      logger: 'xlog',
      resp:   response
    });

    /* prefix to /usr/share */
    var nodeModules = sharePath;

    xLog.info ('prepeon for xcraft modules installation');

    var xcraft = 'xcraft' + xPlatform.getCmdExt ();
    var args = [
      '--modprefix', nodeModules,
      'install',
      'xcraft-contrib-peon',
      'xcraft-core-devel',
      'xcraft-core-fs',
      'xcraft-core-log',
      'xcraft-core-placeholder',
      'xcraft-core-platform'
    ];

    xLog.verb (xcraft);

    xProcess.spawn (xcraft, args, {}, function (err) {
      callback (err);
    });
  };

  return {
    run: function (callback) {
      xcraftInstall (callback);
    }
  };
};
