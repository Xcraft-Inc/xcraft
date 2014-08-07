/* Buses Booting */
'use strict';

var moduleName   = 'bus-boot';
var zogConfig    = require ('../zogConfig.js') ();
var zogLog       = require ('zogLog') (moduleName);
var crypto       = require ('crypto');
var busNotifier  = require ('./busNotifier.js') ();
var busCommander = require ('./busCommander.js') ();
var EventEmitter = require ('events').EventEmitter;

var bootReady = false;
var token     = '';
var emitter   = new EventEmitter ();
var notifier  = {};


var generateBusToken = function (callbackDone)
{
  var createKey = function (key)
  {
    var shasum = crypto.createHash('sha1');
    shasum.update(buf);
    return shasum.digest ('base64');
  };

  var buf = null;

  try
  {
    buf = crypto.randomBytes (256);
  }
  catch (ex)
  {
    /* Handle error.
     * Most likely, entropy sources are drained.
     */
    zogLog.err (ex);
    crypto.pseudoRandomBytes (256, function (ex, buf)
    {
      if (ex)
        throw ex;
    });
  }

  callbackDone (createKey (buf));
};

/**
 * Browse /scripts for zog modules, and register exported busCommands.
 */
var loadCommandsRegistry = function ()
{
  var path  = require ('path');
  var zogFs = require ('zogFs');

  var zogModules = {};
  var zogModulesFiles = zogFs.ls (zogConfig.scriptsRoot, /zog.+\.js$/);

  zogModulesFiles.forEach (function (fileName)
  {
    zogModules[fileName] = require (path.join (zogConfig.scriptsRoot,
                                               fileName));

    if (zogModules[fileName].hasOwnProperty ('busCommands'))
    {
      zogModules[fileName].busCommands ().forEach (function (cmd)
      {
        var commandName = fileName.replace (/\.js$/, '') + '.' + cmd.name;
        busCommander.registerCommandHandler (commandName, cmd.handler);
      });
    }
  });
};

/**
 * Last action call, emit ready.
 */
var emitReady = function ()
{
  notifier = busNotifier.bus;
  bootReady = true;
  emitter.emit ('ready');
};

var startNotifier = function ()
{
  busNotifier.start (zogConfig.bus.host,
                     parseInt (zogConfig.bus.notifierPort),
                     emitReady ());
};

exports.getEmitter = emitter;

exports.getNotifier = function ()
{
  return notifier;
};

exports.getToken = function ()
{
  return token;
};

exports.boot = function ()
{
  zogLog.verb ("Booting...");

  /* init all boot chain */
  generateBusToken (function (genToken)
  {
    zogLog.verb ('Bus token created: %s', genToken);
    token = genToken;
    loadCommandsRegistry ();
    busCommander.start (zogConfig.bus.host,
                        parseInt (zogConfig.bus.commanderPort),
                        startNotifier ());
  });
};

exports.stop = function ()
{
  zogLog.verb ('Buses stop called');
  emitter.emit ('stop');
  busNotifier.stop ();
  busCommander.stop ();
};
