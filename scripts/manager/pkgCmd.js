'use strict';

var moduleName = 'command';

var fs   = require ('fs');
var path = require ('path');
var util = require ('util');

var zogConfig  = require ('../zogConfig.js') ();
var zogLog     = require ('zogLog') (moduleName);
var pkgControl = require ('./pkgControl.js');
var wpkgEngine = require ('./wpkgEngine.js');


var updateAndInstall = function (packageName, arch)
{
  wpkgEngine.update (arch, function (done)
  {
    if (done)
      wpkgEngine.install (packageName, arch);
  });
};

var addRepositoryForAll = function (packageName, arch)
{
  /* This repository is useful for all architectures. */
  var allRespository = path.join (zogConfig.pkgDebRoot, 'all');

  if (fs.existsSync (allRespository))
  {
    var source = util.format ('wpkg file://%s/ %s',
                              allRespository.replace (/\\/g, '/'),
                              zogConfig.pkgRepository);
    wpkgEngine.addSources (source, arch, function (done)
    {
      if (!done)
      {
        zogLog.err ('impossible to add the source path for "all"');
        return;
      }

      updateAndInstall (packageName, arch);
    })
  }
  else
    updateAndInstall (packageName, arch);
};

exports.install = function (packageRef)
{
  var packageName = packageRef.replace (/:.*/, '');
  var arch        = packageRef.replace (/.*:/, '');

  zogLog.verb ('install package name: ' + packageName + ' on architecture: ' + arch);

  /* FIXME: provide the possibility to install a package for 'all'. */
  if (zogConfig.architectures.indexOf (arch) == -1)
  {
    zogLog.err ('the architecture ' + arch + ' is unknown');
    return;
  }

  /* Check if the admindir exists; create if necessary. */
  if (fs.existsSync (path.join (zogConfig.pkgTargetRoot, arch, 'var', 'lib', 'wpkg')))
  {
    addRepositoryForAll (packageName, arch);
    return;
  }

  wpkgEngine.createAdmindir (arch, function (done)
  {
    if (!done)
    {
      zogLog.err ('impossible to create the admin directory');
      return;
    }

    var source = util.format ('wpkg file://%s/ %s',
                              path.join (zogConfig.pkgDebRoot, arch).replace (/\\/g, '/'),
                              zogConfig.pkgRepository);
    wpkgEngine.addSources (source, arch, function (done)
    {
      if (!done)
      {
        zogLog.err ('impossible to add the source path for "%s"', arch);
        return;
      }

      addRepositoryForAll (packageName, arch);
    })
  });
};
