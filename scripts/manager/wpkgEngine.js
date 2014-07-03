
var moduleName = 'manager';

var path      = require ('path');
var zogConfig = require ('../zogConfig.js') ();
var zogLog    = require ('zogLog') (moduleName);

var pkgConfig = require (path.join (zogConfig.pkgBaseRoot, 'wpkg', 'config.json'));

var wpkgArgs = function (callbackDone)
{
  var spawn = require ('child_process').spawn;
  var bin   = path.resolve (zogConfig.toolchainRoot, pkgConfig.out);

  var run = function (args, packagePath)
  {
    zogLog.info ('wpkg command for ' + packagePath);

    args.push (packagePath);
    var wpkg = spawn (bin, args);

    wpkg.stdout.on ('data', function (data)
    {
      data.toString ().trim ().split ('\n').forEach (function (line)
      {
        if (/^error/.test (line))
          zogLog.err (line);
        else
          zogLog.verb (line);
      });
    });

    wpkg.stderr.on ('data', function (data)
    {
      data.toString ().trim ().split ('\n').forEach (function (line)
      {
        if (/^wpkg:debug/.test (line))
          zogLog.verb (line);
        else if (/^wpkg:info/.test (line))
          zogLog.info (line);
        else
          zogLog.err (line);
      });
    });

    wpkg.on ('error', function (data)
    {
      zogLog.err (data);
      if (callbackDone)
        callbackDone (false);
    });

    wpkg.on ('close', function (code)
    {
      zogLog.info ('wpkg command terminated for ' + packagePath);
      if (callbackDone)
        callbackDone (true);
    });
  };

  return {
    build: function (packagePath)
    {
      var args =
      [
        '--verbose',
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
  var wpkg = new wpkgArgs (callbackDone);
  wpkg.build (packagePath);
}
