
var moduleName = 'manager';

var path       = require ('path');
var zogLog     = require ('../lib/zogLog.js')(moduleName);
var pkgControl = require ('./pkgControl.js');

exports.package = function (packageName)
{
  try
  {
    var controlFiles = pkgControl.controlFiles (packageName, true);

    var wpkgEngine = require ('./wpkgEngine.js');
    controlFiles.forEach (function (controlFile)
    {
      var packagePath = path.resolve (path.dirname (controlFile), '..');

      /* Build the package with wpkg. */
      wpkgEngine.build (packagePath);
    });
  }
  catch (err)
  {
    zogLog.err (err);
  }
}
