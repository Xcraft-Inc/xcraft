
var moduleName = 'manager';

var path       = require ('path');
var zogConfig  = require ('../zogConfig.js') ();
var zogFs      = require ('../lib/zogFs.js');
var zogLog     = require ('../lib/zogLog.js')(moduleName);
var pkgControl = require ('./pkgControl.js');

var copyTemplateFiles = function (packagePath, postInstDir)
{
  var zogPlatform = require ('../lib/zogPlatform.js');

  var installerFileIn  = path.join (zogConfig.pkgTemplatesRoot, zogConfig.pkgInstaller);
  var installerFileOut = path.join (postInstDir, zogConfig.pkgInstaller);

  zogFs.cp (installerFileIn, installerFileOut);

  var postinstFileIn  = path.join (zogConfig.pkgTemplatesRoot, zogConfig.pkgPostinst);
  var postinstFileOut = path.join (packagePath, 'wpkg', zogConfig.pkgPostinst);

  zogFs.cp (postinstFileIn, postinstFileOut);
}

exports.package = function (packageName, callbackDone)
{
  try
  {
    var controlFiles = pkgControl.controlFiles (packageName, true);

    var wpkgEngine = require ('./wpkgEngine.js');
    controlFiles.forEach (function (controlFile)
    {
      var packagePath = path.resolve (path.dirname (controlFile), '..');

      /* Reserved directory for the post-installer. */
      var postInstDir = path.join (packagePath, 'usr', 'share', packageName);
      zogFs.mkdir (postInstDir);

      /* TODO: the templates should be copy only when it is necessary; like when
       * a web-package and (or) an installer (msi-like) is used for example.
       */
      copyTemplateFiles (packagePath, postInstDir);

      /* Build the package with wpkg. */
      wpkgEngine.build (packagePath, function (error)
      {
        /* When we reach the last item, then we have done all async work. */
        if (callbackDone && controlFile == controlFiles[controlFiles.length - 1])
          callbackDone (true);
      });
    });
  }
  catch (err)
  {
    zogLog.err (err);
  }
}
