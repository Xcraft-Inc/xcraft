'use strict';

var moduleName = 'wpkg';

var path        = require ('path');
var fs          = require ('fs');
var zogProcess  = require ('zogProcess');
var zogConfig   = require ('./zogConfig.js') ();
var zogPlatform = require ('zogPlatform');
var zogLog      = require ('zogLog') (moduleName);

var pkgConfig = JSON.parse (fs.readFileSync (path.join (zogConfig.pkgBaseRoot, moduleName, 'config.json')));
var cmd = {};


/* TODO: must be generic. */
var makeRun = function ()
{
  zogLog.info ('begin building of wpkg')

  var os = require ('os');
  var args =
  [
    'all',
    'install'
  ];

  /* The make from MSYS/MinGW seems bugged on Windows. */
  if (zogPlatform.getOs () !== 'win')
    args.unshift ('-j', os.cpus ().length);

  var make = zogProcess.spawn ('make', args, function (done)
  {
    if (done)
      zogLog.info ('wpkg is built and installed');
  }, function (line)
  {
    zogLog.verb (line);
  }, function (line)
  {
    zogLog.warn (line);
  });
};

/* TODO: must be generic. */
var cmakeRun = function (srcDir)
{
  /* FIXME, TODO: use a backend (a module) for building with cmake. */
  /* cmake -DCMAKE_INSTALL_PREFIX:PATH=/usr . && make all install */

  var zogFs = require ('zogFs');
  var buildDir = path.join (srcDir, '..', 'BUILD');
  zogFs.mkdir (buildDir);

  var args =
  [
    '-DCMAKE_INSTALL_PREFIX:PATH=' + path.resolve (pkgConfig.out, '..', '..'),
    srcDir
  ];

  if (zogPlatform.getOs () === 'win')
    args.unshift ('-G', 'MSYS Makefiles');

  process.chdir (buildDir);
  var cmake = zogProcess.spawn ('cmake', args, function (done)
  {
    if (done)
      makeRun ();
  }, function (line)
  {
    zogLog.verb (line);
  }, function (line)
  {
    zogLog.err (line);
  });
};

/* TODO: must be generic. */
var patchRun = function (srcDir)
{
  var args =
  [
    '-p1',
    srcDir,
    path.join (zogConfig.pkgBaseRoot, moduleName, 'patch', '001_msys-mingw32.patch')
  ];

  var cmake = zogProcess.spawn ('patch', args, function (done)
  {
    if (done)
      cmakeRun ();
  }, function (line)
  {
    zogLog.verb (line);
  }, function (line)
  {
    zogLog.err (line);
  });
};

/**
 * Install the wpkg package.
 */
cmd.install = function ()
{
  var zogHttp = require ('zogHttp');
  var os = zogPlatform.getOs ();

  /* FIXME: use the sources with Windows too. */
  if (os == 'win')
  {
    var inputFile  = pkgConfig.bin[os];
    var outputFile = path.normalize (pkgConfig.out);

    zogHttp.get (inputFile, outputFile + zogPlatform.getExecExt (), function ()
    {
      zogLog.info ('wpkg is installed');
    });
  }
  else
  {
    var archive = path.basename (pkgConfig.src);
    var inputFile  = pkgConfig.src;
    var outputFile = path.join (zogConfig.tempRoot, 'src', archive);

    zogHttp.get (inputFile, outputFile, function ()
    {
      var zogExtract = require ('zogExtract');

      /* HACK: a very long filename exists in the tarball, then it is a
       *       problem for node.js and the 260 chars limitation.
       */
      zogExtract.targz (outputFile, path.dirname (outputFile), /very-very-very-long/, function (done)
      {
        if (!done)
          return;

        var srcDir = path.join (zogConfig.tempRoot, 'src', pkgConfig.name + '_' + pkgConfig.version);

        if (os === 'win')
          patchRun (srcDir);
        else
          cmakeRun (srcDir);
      });
    });
  }
};

/**
 * Uninstall the wpkg package.
 */
cmd.uninstall = function ()
{
  var fs = require ('fs');

  var outputFile = path.normalize (pkgConfig.out);
  fs.unlinkSync (outputFile + zogPlatform.getExecExt ());
};

/**
 * Retrieve the list of available commands.
 * @returns {string[]} The list of commands.
 */
exports.args = function ()
{
  var list = [];

  Object.keys (cmd).forEach (function (action)
  {
    list.push (action);
  });

  return list;
};

/**
 * Actions called from commander with --wpkg.
 * @param {string} act - The action [install, uninstall].
 */
exports.action = function (act)
{
  zogLog.info ('run action ' + act);

  try
  {
    cmd[act] ();
  }
  catch (err)
  {
    zogLog.err (act + ': ' + err.message);
  }
};
