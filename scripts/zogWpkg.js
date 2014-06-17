
var moduleName = 'wpkg';

var path        = require ('path');
var zogConfig   = require ('./zogConfig.js');
var zogPlatform = require ('./lib/zogPlatform.js');
var zogLog      = require ('./lib/zogLog.js')(moduleName);

var pkgConfig = require (path.join (zogConfig.pkgBaseRoot, moduleName, 'config.json'));
var cmd = {};

/**
 * Install the package in /tools.
 */
cmd.install = function ()
{
  var inputFile  = pkgConfig.bin[zogPlatform.getOs ()];
  var outputFile = pkgConfig.out;

  var zogHttp = require ('./lib/zogHttp.js');
  zogHttp.get (inputFile, outputFile + zogPlatform.getExecExt ());
}

/**
 * Uninstall the package from /tools.
 */
cmd.uninstall = function ()
{
  var fs = require ('fs');

  var outputFile = pkgConfig.out;
  fs.unlinkSync (outputFile + zogPlatform.getExecExt ());
}

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
    zogLog.err (act, err);
  }
}
