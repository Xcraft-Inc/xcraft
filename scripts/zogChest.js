
var moduleName = 'chest';

var fs        = require ('fs');
var zogConfig = require ('./zogConfig.js');
var zogLog    = require ('./lib/zogLog.js')(moduleName);

var cmd = {};

/**
 * Start the chest server.
 */
cmd.start = function ()
{
  var spawn = require ('child_process').spawn;

  if (fs.existsSync (zogConfig.chestServerPid))
  {
    zogLog.warn ('the chest server seems running');

    var isRunning = true;
    var pid = fs.readFileSync (zogConfig.chestServerPid, 'utf8');

    try
    {
      process.kill (pid, 0);
    }
    catch (err)
    {
      if (err.code == 'ESRCH')
      {
        zogLog.warn ('but the process can not be found, then we try to start it');
        fs.unlinkSync (zogConfig.chestServerPid);
        isRunning = false;
      }
    }

    if (isRunning)
      return;
  }

  var logout = fs.openSync (zogConfig.chestServerLog, 'a');
  var logerr = fs.openSync (zogConfig.chestServerLog, 'a');
  var chest = spawn ('node', [ zogConfig.chestServer ],
  {
    detached: true,
    stdio: [ 'ignore', logout, logerr ]
  });

  zogLog.verb ('chest server PID: ' + chest.pid);
  fs.writeFileSync (zogConfig.chestServerPid, chest.pid);

  chest.unref ();
}

/**
 * Stop the chest server.
 */
cmd.stop = function ()
{
  try
  {
    var pid = fs.readFileSync (zogConfig.chestServerPid, 'utf8');
    process.kill (pid, 'SIGTERM');
    fs.unlinkSync (zogConfig.chestServerPid);
  }
  catch (err)
  {
    if (err.code != 'ENOENT')
      zogLog.err (err);
  }
}

/**
 * Restart the chest server.
 */
cmd.restart = function ()
{
  cmd.stop ();
  cmd.start ();
}

/**
 * Send a file to the chest server.
 */
cmd.send = function (file)
{
  zogLog.info ('send ' + file + ' to the chest');

  var zogHttp = require ('./lib/zogHttp.js');
  zogHttp.post (file, zogConfig.chestServerName, zogConfig.chestServerPort);
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
 * Actions called from commander with --chest.
 * @param {string} act - The action [start, stop, send].
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
    zogLog.err (act, err);
  }
}
