'use strict';

module.exports = function (packagePath, sharePath) {
  var path = require ('path');
  var fse  = require ('fs-extra');
  var xcraftConfig = require ('xcraft-core-etc').load ('xcraft');
  var packageName = path.basename (__dirname);

  var zogLog = require ('xcraft-core-log') (packageName);

  var copyXcraftModules = function () {
    var zogFs = require ('xcraft-core-fs');

    var zogModules = zogFs.lsdir (xcraftConfig.nodeModulesRoot, /^xcraft-core/);

    zogModules.forEach (function (mod) {
      var inDir  = path.join (xcraftConfig.nodeModulesRoot, mod);
      var outDir = path.join (sharePath, 'node_modules', mod);

      zogLog.verb (inDir + ' -> ' + outDir);
      fse.copySync (inDir, outDir);
    });
  };

  return {
    copy: function (callbackDone) {
      copyXcraftModules ();
      callbackDone (true);
    }
  };
};
