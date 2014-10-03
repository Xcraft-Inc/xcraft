'use strict';

module.exports = function (zogConfig, packagePath, sharePath) {
  var path = require ('path');
  var fse  = require ('fs-extra');

  var packageName = path.basename (__dirname);

  var zogLog = require ('xcraft-core-log') (packageName);

  var copyXcraftModules = function () {
    var zogFs = require ('xcraft-core-fs');

    var zogModules = zogFs.lsdir (zogConfig.nodeModulesRoot, /^xcraft-core/);

    zogModules.forEach (function (mod) {
      var inDir  = path.join (zogConfig.nodeModulesRoot, mod);
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
