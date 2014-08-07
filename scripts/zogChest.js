'use strict';

var moduleName = 'chest';

var fs        = require ('fs');
var zogConfig = require ('./zogConfig.js') ();
var zogLog    = require ('zogLog') (moduleName);
var busClient = require (zogConfig.busClient);

var cmd = {};

/**
 * Start the chest server.
 */
cmd.start = function ()
{
  var spawn = require ('child_process').spawn;
  var isRunning = false;

  if (fs.existsSync (zogConfig.chest.pid))
  {
    zogLog.warn ('the chest server seems running');

    isRunning = true;
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
  }

  if (!isRunning)
  {
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
  }

  busClient.events.send ('zogChest.start.finish');
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

  busClient.events.send ('zogChest.stop.finish');
};

/**
 * Restart the chest server.
 */
cmd.restart = function ()
{
  cmd.stop ();
  cmd.start ();

  busClient.events.send ('zogChest.restart.finish');
};

/**
 * Send a file to the chest server.
 * @param {Object} msg
 */
cmd.send = function (msg)
{
  var file = msg.data;
  var path = require ('path');

  file = path.resolve (file);

  zogLog.info ('send ' + file + ' to the chest');

  var chestClient = require ('./chest/chestClient.js');
  chestClient.upload (file, function (error)
  {
    if (error)
      zogLog.err (error);

    busClient.events.send ('zogChest.send.finish');
  });
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
