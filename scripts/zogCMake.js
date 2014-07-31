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


/**
 * Install the cmake package.
 */
cmd.install = function ()
{
  zogLog.warn ('stub');
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
    zogLog.err (act, err);
  }
};
