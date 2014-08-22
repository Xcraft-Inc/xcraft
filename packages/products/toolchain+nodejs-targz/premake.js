'use strict';

module.exports = function (zogConfig, packagePath, sharePath)
{
  var path = require ('path');
  var fse  = require ('fs-extra');

  var packageName = path.basename (__dirname);
  var sharePath   = sharePath;

  var zogLog = require ('zogLog') (packageName);

  var pkgDefinition = require (zogConfig.libPkgDefinition);
  var packageDef = pkgDefinition.load (packageName);

  var npmInstall = function (callbackDone)
  {
    var zogPlatform = require ('zogPlatform');
    var zogProcess  = require ('zogProcess');
    var zogFs       = require ('zogFs');

    /* prefix to /usr/share */
    var nodeModules = path.join (sharePath, '..');
    zogFs.mkdir (nodeModules);

    var npm = 'npm' + zogPlatform.getCmdExt ();
    var args =
    [
      'install',
      '--prefix', nodeModules,
      'tar.gz@' + packageDef.version
    ];

    zogProcess.spawn (npm, args, function (done)
    {
      callbackDone (done);
    }, function (line)
    {
      zogLog.verb (line);
    }, function (line)
    {
      zogLog.err (line);
    });
  };

  return {
    copy: function (callbackDone)
    {
      npmInstall (callbackDone);
    }
  };
};
