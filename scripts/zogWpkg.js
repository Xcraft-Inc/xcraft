
var moduleName = 'wpkg';

var path        = require ('path');
var zogConfig   = require ('./zogConfig.js') ();
var zogPlatform = require ('zogPlatform');
var zogLog      = require ('zogLog') (moduleName);

var pkgConfig = require (path.join (zogConfig.pkgBaseRoot, moduleName, 'config.json'));
var cmd = {};

/**
 * Install the wpkg package.
 */
cmd.install = function ()
{
  var inputFile  = pkgConfig.bin[zogPlatform.getOs ()];
  var outputFile = path.normalize (pkgConfig.out);

  var zogHttp = require ('zogHttp');
  zogHttp.get (inputFile, outputFile + zogPlatform.getExecExt ());
}

/**
 * Uninstall the wpkg package.
 */
cmd.uninstall = function ()
{
  var fs = require ('fs');

  var outputFile = path.normalize (pkgConfig.out);
  fs.unlinkSync (outputFile + zogPlatform.getExecExt ());
}

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
