'use strict';

var moduleName = 'prepeon';

module.exports = function (packagePath, sharePath) {
  var xLog = require ('xcraft-core-log') (moduleName);

  var xcraftInstall = function (callback) {
    var xPlatform = require ('xcraft-core-platform');
    var xProcess  = require ('xcraft-core-process') ({logger: 'xlog', mod: moduleName});

    /* prefix to /usr/share */
    var nodeModules = sharePath;

    xLog.info ('prepeon for xcraft modules installation');

    var xcraft = 'xcraft' + xPlatform.getCmdExt ();
    var args = [
      '--modprefix', nodeModules,
      'install',
      'xcraft-contrib-peon',
      'xcraft-core-devel',
      'xcraft-core-log',
      'xcraft-core-placeholder'
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
