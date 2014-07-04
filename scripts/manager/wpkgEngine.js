
var moduleName = 'wpkg';

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
    build: function (packagePath, arch)
    {
      var args =
      [
        '--verbose',
        '--build',
        '--output-repository-dir', path.join (zogConfig.pkgDebRoot, arch)
      ];

      run (args, packagePath);
    },

    createIndex: function (repositoryPath, indexName)
    {
      var args =
      [
        '--verbose',
        '--repository', repositoryPath,
        '--create-index'
      ];

      run (args, path.join (repositoryPath, indexName));
    },

    install: function (packagePath, arch)
    {
      var args =
      [
        '--verbose',
        '--root', path.join (zogConfig.pkgTargetRoot, arch),
        '--install'
      ];

      run (args, packagePath);
    },

    createAdmindir: function (controlFile, arch)
    {
      var args =
      [
        '--verbose',
        '--root', path.join (zogConfig.pkgTargetRoot, arch),
        '--create-admindir'
      ];

      run (args, controlFile);
    },

    addSources: function (source, arch)
    {
      var args =
      [
        '--verbose',
        '--root', path.join (zogConfig.pkgTargetRoot, arch),
        '--add-sources'
      ];

      run (args, source);
    },

    update: function (arch)
    {
      var args =
      [
        '--verbose',
        '--root', path.join (zogConfig.pkgTargetRoot, arch),
        '--update'
      ];

      run (args);
    }
  };
};

exports.build = function (packagePath, callbackDone)
{
  var pathObj = packagePath.split (path.sep);

  /* Retrieve the architecture which is in the packagePath. */
  var arch = pathObj[pathObj.length - 2];

  var wpkg = new wpkgArgs (function (done)
  {
    var wpkg = new wpkgArgs (callbackDone);
    var repositoryPath = path.join (zogConfig.pkgDebRoot, arch, zogConfig.pkgRepository);

    wpkg.createIndex (repositoryPath, 'index.tar.gz');
  });

  wpkg.build (packagePath, arch);
}

exports.install = function (packageName, arch, callbackDone)
{
  var wpkg = new wpkgArgs (callbackDone);
  wpkg.install (packageName, arch);
}

exports.createAdmindir = function (arch, callbackDone)
{
  var util = require ('util');
  var fs   = require ('fs');

  var controlFile = path.join (zogConfig.tempRoot, 'control');
  var data = util.format ('Architecture: %s\n' +
                          'Maintainer: "Zog Toolchain" <zog@epsitec.ch>\n' +
                          'Distribution: %s\n',
                          arch, zogConfig.pkgRepository);

  fs.writeFileSync (controlFile, data);

  var wpkg = new wpkgArgs (callbackDone);
  wpkg.createAdmindir (controlFile, arch);
}

exports.addSources = function (sourcePath, arch, callbackDone)
{
  var wpkg = new wpkgArgs (callbackDone);
  wpkg.addSources (sourcePath, arch);
}

exports.update = function (arch, callbackDone)
{
  var wpkg = new wpkgArgs (callbackDone);
  wpkg.update (arch);
}
