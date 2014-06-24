
var moduleName = 'manager';

var path       = require ('path');
var zogLog     = require ('../lib/zogLog.js')(moduleName);
var pkgControl = require ('./pkgControl.js');

exports.package = function (packageName, callbackDone)
{
  try
  {
    var controlFiles = pkgControl.controlFiles (packageName, true);

    var wpkgEngine = require ('./wpkgEngine.js');
    controlFiles.forEach (function (controlFile)
    {
      var packagePath = path.resolve (path.dirname (controlFile), '..');

      /* Build the package with wpkg. */
      wpkgEngine.build (packagePath, function (error)
      {
        /* When we reach the last item, then we have done all async work. */
        if (controlFile == controlFiles[controlFiles.length - 1])
          callbackDone (true);
      });
    });
  }
  catch (err)
  {
    zogLog.err (err);
  }
}
