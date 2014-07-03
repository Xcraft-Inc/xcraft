
var moduleName = 'command';

var fs   = require ('fs');
var path = require ('path');

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
}

exports.install = function (packageRef)
{
  var util = require ('util');

  var packageName = packageRef.replace (/:.*/, '');
  var arch        = packageRef.replace (/.*:/, '');

  zogLog.verb ('install package name: ' + packageName + ' on architecture: ' + arch);

  /* FIXME: check the architecture validity. */

  /* Check if the admindir exists; create if necessary. */
  if (!fs.existsSync (path.join (zogConfig.pkgTargetRoot, arch, 'var', 'lib', 'wpkg')))
    wpkgEngine.admindir (arch, function (done)
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
          zogLog.err ('impossible to add de source path');
          return;
        }

        updateAndInstall (packageName, arch);
      })
    });
  else
    updateAndInstall (packageName, arch);
}
