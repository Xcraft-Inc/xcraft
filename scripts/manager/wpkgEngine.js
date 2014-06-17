
var moduleName = 'manager';

var path      = require ('path');
var zogConfig = require ('../zogConfig.js');
var zogLog    = require ('../lib/zogLog.js')(moduleName);

var pkgConfig = require (path.join (zogConfig.pkgBaseRoot, 'wpkg', 'config.json'));

var wpkgArgs = function (wpkgBin)
{
  var exec = require ('child_process').exec;
  var bin  = wpkgBin;

  var run = function (arg, packagePath)
  {
    exec (bin + ' ' + arg + ' "' + packagePath + '"', function (error, stdout, stderr)
    {
      zogLog.verb ('wpkg build for ' + packagePath + '\n' + stdout);

      if (error)
        zogLog.err ('unable to build the package\n' + stderr);
    });
  };

  return {
    build: function (packagePath)
    {
      run ('--build', packagePath);
    }
  }
};

exports.build = function (packagePath)
{
  var wpkg = new wpkgArgs (path.resolve (zogConfig.toolchainRoot, pkgConfig.out));
  wpkg.build (packagePath);
}
