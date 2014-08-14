'use strict';

var moduleName = 'lokthar';

var fs          = require ('fs');
var sys         = require ('sys');
var path        = require ('path');
var async       = require ('async');
var exec        = require ('child_process').exec;
var zogConfig   = require ('./zogConfig.js') ();
var zogPlatform = require ('zogPlatform');
var zogLog      = require ('zogLog') (moduleName);
var busClient   = require (zogConfig.busClient);


var buildDir      = path.join (zogConfig.loktharRoot, '/build/');
var atomDir       = path.join (zogConfig.loktharRoot, '/build/atom-shell/');
var loktharAppDir = path.join (zogConfig.loktharRoot, '/lokthar-app');

var cmd = {};

var build = function (callback)
{
  exec ('npm install --prefix ' + buildDir + ' ' + buildDir, function (error, stdout, stderr)
  {
    zogLog.verb ('build lokthar outputs:\n' + stdout);

    if (error)
      callback ('unable to build lokthar\n' + stderr);
    else
      callback ();
  });
};

var grunt = function (callback)
{
  var gruntfile = path.join (buildDir, 'gruntfile.js');
  exec ('node ' + zogConfig.binGrunt + ' --gruntfile ' + gruntfile + ' download-atom-shell', function (error, stdout, stderr)
  {
    zogLog.verb ('grunt lokthar outputs:\n' + stdout);

    var atom = path.join (atomDir, 'atom' + zogPlatform.getExecExt ());
    /* chmod +x flag to atom for Unix, ignored on Windows. */
    fs.chmodSync (atom, 493 /* 0755 */);

    if (error)
      callback ('unable to grunt lokthar\n' + stderr);
    else
      callback ();
  });
};

/**
 * Run the lokthar frontend.
 * Lokthar is based on atom-shell.
 */
cmd.run = function ()
{
  var atom = path.join (atomDir, 'atom' + zogPlatform.getExecExt ());

  /* We provide bus token for lokthar via argv[2]. */
  var busToken = busClient.getToken ();

  exec (atom + ' ' + loktharAppDir + ' ' + busToken, function (error, stdout, stderr)
  {
    zogLog.verb ('atom outputs:\n' + stdout);

    if (error)
      zogLog.err ('unable to exec atom\n' + stderr);

    busClient.events.send ('zogLokthar.run.finished');
  });
};

/**
 * Install the lokthar frontend.
 */
cmd.install = function ()
{
  async.auto (
  {
    taskBuild: build,
    taskGrunt: ['taskBuild', grunt]
  }, function (err, results)
  {
    if (err)
      zogLog.err (err);

    busClient.events.send ('zogLokthar.install.finished');
  });
};

/**
 * Uninstall the lokthar frontend.
 */
cmd.uninstall = function ()
{
  zogLog.warn ('the uninstall action is not implemented');
  busClient.events.send ('zogLokthar.uninstall.finished');
};

/**
 * Retrieve the list of available commands.
 * @returns {Object[]} The list of commands.
 */
exports.busCommands = function ()
{
  var list = [];

  Object.keys (cmd).forEach (function (action)
  {
    list.push (
    {
      name   : action,
      handler: cmd[action]
    });
  });

  return list;
};
