
var moduleName = 'manager';

var path      = require ('path');
var zogConfig = require ('../zogConfig.js') ();
var zogLog    = require ('zogLog') (moduleName);

var pkgConfig = require (path.join (zogConfig.pkgBaseRoot, 'wpkg', 'config.json'));

var wpkgArgs = function (wpkgBin, callbackDone)
{
  var spawn = require ('child_process').spawn;
  var bin   = wpkgBin;

  var run = function (args, packagePath)
  {
    zogLog.info ('wpkg build for ' + packagePath);

    args.push (packagePath);
    var wpkg = spawn (bin, args);

    wpkg.stdout.on ('data', function (data)
    {
      zogLog.verb (data);
    });

    wpkg.stderr.on ('data', function (data)
    {
      zogLog.info (data);
    });

    wpkg.on ('error', function (data)
    {
      zogLog.err (data);
      if (callbackDone)
        callbackDone (false);
    });

    wpkg.on ('close', function (code)
    {
      zogLog.info ('wpkg build terminated for ' + packagePath);
      if (callbackDone)
        callbackDone (true);
    });
  };

  return {
    build: function (packagePath)
    {
      var args =
      [
        '-v',
        '--build',
        '--create-index', 'index.tar',
        '--output-repository-dir', zogConfig.pkgDebRoot
      ];

      run (args, packagePath);
    }
  };
};

exports.build = function (packagePath, callbackDone)
{
  var wpkg = new wpkgArgs (path.resolve (zogConfig.toolchainRoot, pkgConfig.out), callbackDone);
  wpkg.build (packagePath);
}
