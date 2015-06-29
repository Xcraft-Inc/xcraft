'use strict';

module.exports = function (packagePath, sharePath) {
  var path = require ('path');
  var packageName = path.basename (__dirname);

  var xLog = require ('xcraft-core-log') (packageName);

  require ('xcraft-core-buslog') (xLog);

  var xcraftInstall = function (callback) {
    var xPlatform = require ('xcraft-core-platform');
    var xProcess  = require ('xcraft-core-process') ({logger: 'xlog', mod: packageName});

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
