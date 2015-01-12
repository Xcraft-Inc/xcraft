'use strict';

module.exports = function (packagePath, sharePath) {
  var path = require ('path');
  var packageName = path.basename (__dirname);

  var xLog = require ('xcraft-core-log') (packageName);

  var xcraftInstall = function (callback) {
    var xPlatform = require ('xcraft-core-platform');
    var xProcess  = require ('xcraft-core-process');

    /* prefix to /usr/share */
    var nodeModules = sharePath;

    xLog.info ('premake for xcraft modules installation');

    var xcraft = 'xcraft' + xPlatform.getCmdExt ();
    var args = [
      '--modprefix', nodeModules,
      'install', 'xcraft-gui'
    ];

    xLog.verb (xcraft);

    xProcess.spawn (xcraft, args, function (err) {
      callback (err);
    }, function (line) {
      xLog.verb (line);
    }, function (line) {
      xLog.err (line);
    });
  };

  return {
    copy: function (callback) {
      xcraftInstall (callback);
    }
  };
};
