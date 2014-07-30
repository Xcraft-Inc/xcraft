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

var parsePkgRef = function (packageRef)
{
  return {
    'name': packageRef.replace (/:.*/, ''),
    'arch': packageRef.replace (/.*:/, '')
  };
};

var checkArch = function (arch)
{
  if (zogConfig.architectures.indexOf (arch) == -1)
  {
    zogLog.err ('the architecture ' + arch + ' is unknown');
    return false;
  }

  return true;
};

exports.install = function (packageRef)
{
  var pkg = parsePkgRef (packageRef);

  zogLog.verb ('install package name: ' + pkg.name + ' on architecture: ' + pkg.arch);

  if (!checkArch (pkg.arch))
    return;

  /* Check if the admindir exists; create if necessary. */
  if (fs.existsSync (path.join (zogConfig.pkgTargetRoot, pkg.arch, 'var', 'lib', 'wpkg')))
  {
    addRepositoryForAll (pkg.name, pkg.arch);
    return;
  }

  wpkgEngine.createAdmindir (pkg.arch, function (done)
  {
    if (!done)
    {
      zogLog.err ('impossible to create the admin directory');
      return;
    }

    var source = util.format ('wpkg file://%s/ %s',
                              path.join (zogConfig.pkgDebRoot, pkg.arch).replace (/\\/g, '/'),
                              zogConfig.pkgRepository);
    wpkgEngine.addSources (source, pkg.arch, function (done)
    {
      if (!done)
      {
        zogLog.err ('impossible to add the source path for "%s"', pkg.arch);
        return;
      }

      addRepositoryForAll (pkg.name, pkg.arch);
    })
  });
};
