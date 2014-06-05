
var path        = require ('path');
var zogPlatform = require ('./lib/zogPlatform.js');
var zogConfig   = require ('./lib/zogConfig.js');

var package = 'wpkg';

var pkgConfig = require (path.join (zogConfig.pkgBaseRoot, package, 'config.json'));
var cmd = {};

/**
 * \brief Install the package in /tools.
 */
cmd.install = function ()
{
  var inputFile  = pkgConfig.bin[zogPlatform.getOs ()];
  var outputFile = pkgConfig.out;
  
  var zogHttp = require ('./lib/zogHttp.js');
  zogHttp.get (inputFile, outputFile + zogPlatform.getExecExt ());
}

/**
 * \brief Uninstall the package from /tools.
 */
cmd.uninstall = function ()
{
  var fs = require ('fs');
  
  var outputFile = pkgConfig.out;
  fs.unlinkSync (outputFile + zogPlatform.getExecExt ());
}

/**
 * \brief Actions called from commander with --wpkg.
 */
exports.action = function (act)
{
  console.log ('[stage2:' + package + '] ' + act);

  try
  {
    cmd[act] ();
  }
  catch (err)
  {
    console.log ('[stage2:' + package + ']: ' + err);
  }
}
