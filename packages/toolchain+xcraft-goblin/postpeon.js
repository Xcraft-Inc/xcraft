'use strict';

var moduleName = 'postpeon';

module.exports = function (packagePath, sharePath) {
  var path = require ('path');

  var xLog = require ('xcraft-core-log') (moduleName);
  var xFs  = require ('xcraft-core-fs');

  var xcraftInstall = function (callback) {
    var xPlatform = require ('xcraft-core-platform');
    var xProcess  = require ('xcraft-core-process') ({logger: 'xlog', mod: moduleName});

    xLog.info ('postpeon for xcraft-goblin');

    var xcraft = 'xcraft' + xPlatform.getCmdExt ();
    var args = [
      '--modprefix', sharePath,
      'install', sharePath
    ];

    xLog.verb (xcraft);

    xProcess.spawn (xcraft, args, {}, function (err) {
      callback (err);
    });
  };

  return {
    run: function (callback) {
      xcraftInstall (function (err) {
        var nodeModules = path.join (sharePath, 'node_modules');

        //xFs.rm (nodeModules);
        callback (err);
      });
    }
  };
};
