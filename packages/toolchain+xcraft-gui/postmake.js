'use strict';

module.exports = function (packagePath, sharePath) {
  var path = require ('path');
  var packageName = path.basename (__dirname);

  var xLog = require ('xcraft-core-log') (packageName);
  var xFs  = require ('xcraft-core-fs');

  var xcraftInstall = function (callback) {
    var xPlatform = require ('xcraft-core-platform');
    var xProcess  = require ('xcraft-core-process');

    xLog.info ('postmake for xcraft-gui');

    var xcraft = 'xcraft' + xPlatform.getCmdExt ();
    var args = [
      '--modprefix', sharePath,
      'install', sharePath
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
      xcraftInstall (function (err) {
        var nodeModules = path.join (sharePath, 'node_modules');

        xFs.rmdir (nodeModules);
        callback (err);
      });
    }
  };
};
