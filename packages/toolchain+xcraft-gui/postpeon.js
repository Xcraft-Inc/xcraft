'use strict';

var moduleName = 'postpeon';

module.exports = function (packagePath, sharePath, packageDef, response) {
  var path = require ('path');

  var xLog = require ('xcraft-core-log') (moduleName, response);
  var xFs = require ('xcraft-core-fs');

  var xcraftInstall = function (callback) {
    var xPlatform = require ('xcraft-core-platform');
    var xProcess = require ('xcraft-core-process') ({
      logger: 'xlog',
      resp: response,
    });

    xLog.info ('postpeon for xcraft-gui');

    var xcraft = 'xcraft' + xPlatform.getCmdExt ();
    var args = ['--modprefix', sharePath, 'install', sharePath];

    xLog.verb (xcraft);

    xProcess.spawn (xcraft, args, {}, function (err) {
      callback (err);
    });
  };

  return {
    run: function (callback) {
      xcraftInstall (function (err) {
        var nodeModules = path.join (sharePath, 'node_modules');

        xFs.rm (nodeModules);
        callback (err);
      });
    },
  };
};
