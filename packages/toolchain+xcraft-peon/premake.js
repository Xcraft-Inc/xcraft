'use strict';

module.exports = function (packagePath, sharePath) {
  var path = require ('path');
  var xcraftConfig = require ('xcraft-core-etc').load ('xcraft');
  var packageName = path.basename (__dirname);

  var xLog = require ('xcraft-core-log') (packageName);

  var copyXcraftModules = function () {
    var xFs = require ('xcraft-core-fs');

    var modules = xFs.lsdir (xcraftConfig.nodeModulesRoot, /^xcraft-core/);

    modules.forEach (function (mod) {
      var inDir  = path.join (xcraftConfig.nodeModulesRoot, mod);
      var outDir = path.join (sharePath, 'node_modules', mod);

      xLog.verb (inDir + ' -> ' + outDir);
      xFs.cpdir (inDir, outDir);
    });
  };

  return {
    copy: function (callback) {
      copyXcraftModules ();
      callback ();
    }
  };
};
