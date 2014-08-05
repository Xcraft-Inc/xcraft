'use strict';

var moduleName = 'chest';

var fs        = require ('fs');
var zogConfig = require ('./zogConfig.js') ();
var zogLog    = require ('zogLog') (moduleName);

var cmd = {};

/**
 * Start the chest server.
 */
cmd.start = function ()
{
  var spawn = require ('child_process').spawn;

  if (fs.existsSync (zogConfig.chest.pid))
  {
    zogLog.warn ('the chest server seems running');

    var isRunning = true;
    var pid = fs.readFileSync (zogConfig.chest.pid, 'utf8');

    try
    {
      process.kill (pid, 0);
    }
    catch (err)
    {
      if (err.code == 'ESRCH')
      {
        zogLog.warn ('but the process can not be found, then we try to start it');
        fs.unlinkSync (zogConfig.chest.pid);
        isRunning = false;
      }
    }

    if (isRunning)
      return;
  }

  var logout = fs.openSync (zogConfig.chest.log, 'a');
  var logerr = fs.openSync (zogConfig.chest.log, 'a');
  var chest = spawn ('node', [ zogConfig.chestServer ],
  {
    detached: true,
    stdio: [ 'ignore', logout, logerr ]
  });

  zogLog.verb ('chest server PID: ' + chest.pid);
  fs.writeFileSync (zogConfig.chest.pid, chest.pid);

  chest.unref ();
};

/**
 * Stop the chest server.
 */
cmd.stop = function ()
{
  try
  {
    var pid = fs.readFileSync (zogConfig.chest.pid, 'utf8');
    process.kill (pid, 'SIGTERM');
    fs.unlinkSync (zogConfig.chest.pid);
  }
  catch (err)
  {
    if (err.code != 'ENOENT')
      zogLog.err (err);
  }
};

/**
 * Restart the chest server.
 */
cmd.restart = function ()
{
  cmd.stop ();
  cmd.start ();
};

/**
 * Send a file to the chest server.
 */
cmd.send = function (file)
{
  var path = require ('path');

  file = path.resolve (file);

  zogLog.info ('send ' + file + ' to the chest');

  var chestClient = require ('./chest/chestClient.js');
  chestClient.upload (file);
};

/**
 * Retrieve the list of available commands.
 * @returns {string[]} The list of commands.
 */
exports.args = function ()
{
  /* Commander will use the same actions that the command bus.
   * This code will be dropped when the commander will use the command
   * bus directly.
   */
  return exports.busCommands ();
};

/**
 * Actions called from commander with --chest.
 * @param {string} act - The action [start, stop, restart, send].
 */
exports.action = function (act, opt)
{
  zogLog.info ('run action ' + act + (opt && act == 'send' ? ' (' + opt + ')' : ''));

  try
  {
    cmd[act] (opt);
  }
  catch (err)
  {
    zogLog.err (act + ': ' + err.message);
  }
};

exports.busCommands = function ()
{
  var list = [];

  Object.keys (cmd).forEach (function (cmd)
  {
    list.push (cmd);
  });

  return list;
};
