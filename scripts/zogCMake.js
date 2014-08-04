'use strict';

var moduleName = 'cmake';

var path        = require ('path');
var fs          = require ('fs');
var zogProcess  = require ('zogProcess');
var zogConfig   = require ('./zogConfig.js') ();
var zogPlatform = require ('zogPlatform');
var zogLog      = require ('zogLog') (moduleName);

var pkgConfig = JSON.parse (fs.readFileSync (path.join (zogConfig.pkgBaseRoot, moduleName, 'config.json')));
var cmd = {};


/* TODO: must be generic. */
var bootstrap = function (cmakeDir)
{
  /* FIXME, TODO: use a backend (a module) for building cmake. */
  /* bootstrap --prefix=/mingw && make && make install */

  var zogFs = require ('zogFs');

  var args =
  [
    'bootstrap',
    '--prefix=' + path.resolve (pkgConfig.out)
  ];

  process.chdir (cmakeDir);
  var cmake = zogProcess.spawn ('sh', args, function (done)
  {
    if (done)
      ;
  }, function (line)
  {
    zogLog.verb (line);
  }, function (line)
  {
    zogLog.warn (line);
  });
};

/**
 * Install the cmake package.
 */
cmd.install = function ()
{
  var zogHttp = require ('zogHttp');

  var archive = path.basename (pkgConfig.src);
  var inputFile  = pkgConfig.src;
  var outputFile = path.join (zogConfig.tempRoot, 'src', archive);

  zogHttp.get (inputFile, outputFile, function ()
  {
    var zogExtract = require ('zogExtract');
    var outDir = path.dirname (outputFile);

    zogExtract.targz (outputFile, outDir, null, function (done)
    {
      if (done)
        bootstrap (path.join (outDir, path.basename (outputFile, 'tar.gz')));
    });
  });
};

/**
 * Uninstall the cmake package.
 */
cmd.uninstall = function ()
{
  zogLog.warn ('stub');
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
 * Actions called from commander with --cmake.
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
