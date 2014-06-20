
var moduleName = 'manager';

var path      = require ('path');
var zogConfig = require ('../zogConfig.js');
var zogLog    = require ('../lib/zogLog.js')(moduleName);

var pkgConfig = require (path.join (zogConfig.pkgBaseRoot, 'wpkg', 'config.json'));

var wpkgArgs = function (wpkgBin)
{
  var spawn = require ('child_process').spawn;
  var bin   = wpkgBin;

  var run = function (arg, packagePath)
  {
    zogLog.info ('wpkg build for ' + packagePath);

    var wpkg = spawn (bin, [arg, packagePath]);

    wpkg.stdout.on ('data', function (data)
    {
      zogLog.verb (data);
    });

    wpkg.stderr.on ('data', function (data)
    {
      zogLog.err (data);
    });

    wpkg.on ('error', function (data)
    {
      zogLog.err (data);
    });

    wpkg.on ('close', function (code)
    {
      zogLog.info ('wpkg build terminated for ' + packagePath);
    });
  };

  return {
    build: function (packagePath)
    {
      run ('--build', packagePath);
    }
  };
};

exports.build = function (packagePath)
{
  var wpkg = new wpkgArgs (path.resolve (zogConfig.toolchainRoot, pkgConfig.out));
  wpkg.build (packagePath);
}
