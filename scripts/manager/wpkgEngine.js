
var moduleName = 'wpkg';

var path      = require ('path');
var zogConfig = require ('../zogConfig.js') ();
var zogLog    = require ('zogLog') (moduleName);

var pkgConfig = require (path.join (zogConfig.pkgBaseRoot, 'wpkg', 'config.json'));

/**
 * Create a wrapper on wpkg.
 * @class wpkg wrapper.
 * @param {function(done)} callbackDone
 * @param {boolean} callbackDone.done - True on success.
 */
var wpkgArgs = function (callbackDone)
{
  var spawn = require ('child_process').spawn;
  var bin   = path.resolve (zogConfig.toolchainRoot, pkgConfig.out);

  /**
   * Spawn wpkg and handle the outputs.
   * @param {string[]} args - Arguments.
   * @param {string} [lastArg] - The last argument.
   * @param {function(stdout)} [callbackStdout]
   * @param {string[]} callbackStdout.list - Array of stdout lines.
   */
  var run = function (args, lastArg, callbackStdout)
  {
    var dataStdout = [];
    var cmdName = args[args.length - 1];

    zogLog.info ('begin command ' + cmdName);

    args.push (lastArg);
    var wpkg = spawn (bin, args);

    wpkg.stdout.on ('data', function (data)
    {
      data.toString ().trim ().split ('\n').forEach (function (line)
      {
        if (callbackStdout)
          dataStdout.push (line);

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

      if (callbackStdout)
        callbackStdout (dataStdout);
      if (callbackDone)
        callbackDone (false);
    });

    wpkg.on ('close', function (code)
    {
      zogLog.info ('end command ' + cmdName);

      if (callbackStdout)
        callbackStdout (dataStdout);
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
        '--output-repository-dir', path.join (zogConfig.pkgDebRoot, arch),
        '--build'
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
        '--repository', path.join (zogConfig.pkgDebRoot, arch, zogConfig.pkgRepository),
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
    },

    listIndexPackages: function (repositoryPath, arch, listOut)
    {
      var args =
      [
        '--verbose',
        '--root', path.join (zogConfig.pkgTargetRoot, arch),
        '--list-index-packages'
      ];

      run (args, path.join (repositoryPath, zogConfig.pkgIndex), function (stdout)
      {
        stdout.forEach (function (item)
        {
          var result = item.trim ().match (/.* ([^ _]*)([^ ]*)\.ctrl$/)
          var deb  = result[1] + result[2] + '.deb';
          var name = result[1];

          listOut[name] = deb;
        });
      });
    }
  };
};

/**
 * Build a new package.
 * @param {string} packagePath
 * @param {function(done)} callbackDone
 * @param {boolean} callbackDone.done - True on success.
 */
exports.build = function (packagePath, callbackDone)
{
  var pathObj = packagePath.split (path.sep);

  /* Retrieve the architecture which is in the packagePath. */
  var arch = pathObj[pathObj.length - 2];

  var wpkg = new wpkgArgs (function (done)
  {
    if (!done)
      return;

    var wpkg = new wpkgArgs (callbackDone);
    var repositoryPath = path.join (zogConfig.pkgDebRoot, arch, zogConfig.pkgRepository);

    /* We create or update the index with our new package. */
    wpkg.createIndex (repositoryPath, zogConfig.pkgIndex);
  });

  wpkg.build (packagePath, arch);
}

/**
 * Install a package with its dependencies.
 * @param {string} packageName
 * @param {string} arch - Architecture.
 * @param {function(done)} callbackDone
 * @param {boolean} callbackDone.done - True on success.
 */
exports.install = function (packageName, arch, callbackDone)
{
  var repositoryPath = path.join (zogConfig.pkgDebRoot, arch, zogConfig.pkgRepository);
  var list = [];

  var wpkg = new wpkgArgs (function (done)
  {
    if (!done)
      return;

    /* The list array is populated by listIndexPackages. */
    var debFile = list[packageName];
    if (!debFile)
    {
      zogLog.warn ('the package %s is unavailable', packageName);
      return;
    }

    /* We have found the package, then we can build the full path and install
     * this one to the target root.
     */
    debFile = path.join (repositoryPath, debFile);

    var wpkg = new wpkgArgs (callbackDone);
    wpkg.install (debFile, arch);
  });

  /* wpkg is not able to install a package just by its name. The sources are
   * ignored in this case. Then we must look in the repository index file if
   * the package exists and in order to retrieve the full package name.
   */
  wpkg.listIndexPackages (repositoryPath, arch, list);
}

/**
 * Create the administration directory in the target root.
 * The target root is the destination where are installed the packages.
 * @param {string} arch - Architecture.
 * @param {function(done)} callbackDone
 * @param {boolean} callbackDone.done - True on success.
 */
exports.createAdmindir = function (arch, callbackDone)
{
  var util  = require ('util');
  var fs    = require ('fs');
  var zogFs = require ('zogFs');

  /* This control file is used in order to create a new admin directory. */
  var controlFile = path.join (zogConfig.tempRoot, 'control');
  var data = util.format ('Architecture: %s\n' +
                          'Maintainer: "Zog Toolchain" <zog@epsitec.ch>\n' +
                          'Distribution: %s\n',
                          arch, zogConfig.pkgRepository);

  fs.writeFileSync (controlFile, data);

  /* Create the target directory. */
  zogFs.mkdir (path.join (zogConfig.pkgTargetRoot, arch));

  var wpkg = new wpkgArgs (callbackDone);
  wpkg.createAdmindir (controlFile, arch);
}

/**
 * Add a new source in the target installation.
 * A source is needed in order to upgrade the packages in the target root
 * accordingly to the versions in the repository referenced in the source.
 * @param {string} sourcePath
 * @param {string} arch - Architecture.
 * @param {function(done)} callbackDone
 * @param {boolean} callbackDone.done - True on success.
 */
exports.addSources = function (sourcePath, arch, callbackDone)
{
  var wpkg = new wpkgArgs (callbackDone);
  wpkg.addSources (sourcePath, arch);
}

/**
 * Update the list of available packages from the repository.
 * @param {string} arch - Architecture.
 * @param {function(done)} callbackDone
 * @param {boolean} callbackDone.done - True on success.
 */
exports.update = function (arch, callbackDone)
{
  var wpkg = new wpkgArgs (callbackDone);
  wpkg.update (arch);
}
