'use strict';

module.exports = function (zogConfig, packagePath, sharePath)
{
  var path = require ('path');
  var fse  = require ('fs-extra');

  var packageName = path.basename (__dirname);
  var sharePath   = sharePath;

  var zogLog = require ('zogLog') (packageName);

  var copyZogModules = function ()
  {
    var zogFs = require ('zogFs');

    var zogModules = zogFs.lsdir (zogConfig.nodeModulesRoot, /^zog/);

    zogModules.forEach (function (mod)
    {
      var inDir  = path.join (zogConfig.nodeModulesRoot, mod);
      var outDir = path.join (sharePath, 'node_modules', mod);

      zogLog.verb (inDir + ' -> ' + outDir);
      fse.copySync (inDir, outDir);
    });
  };

  return {
    copy: function (callbackDone)
    {
      copyZogModules ();
      callbackDone (true);
    }
  };
};
