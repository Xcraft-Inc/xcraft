/* Buses Booting */
'use strict';

var moduleName   = 'notification-bus';
var zogConfig    = require ('../zogConfig.js') ();
var zogLog       = require ('zogLog') (moduleName);
var crypto       = require ('crypto');
var busNotifier     = require ('./busNotifier.js') ();
var busCommander    = require ('./busCommander.js') ();
var bootReady    = false;
var token        = '';
var EventEmitter  = require ('events').EventEmitter;



var generateBusToken = function (callbackDone)
{
  var createKey = function (key)
  {
    var shasum = crypto.createHash('sha1');
    shasum.update(buf);
    return shasum.digest ('base64');
  };
  // sync
  try
  {
    var buf = crypto.randomBytes(256);
  }
  catch (ex)
  {
    // handle error
    // most likely, entropy sources are drained
    console.log(ex);
    crypto.pseudoRandomBytes(256, function (ex, buf) {
        if(ex)
          throw ex;
    })
  }

  callbackDone(createKey(buf));
};

//browse /scripts for zog modules, and register busCommands
var loadCommandsRegistry = function ()
{
  var path  = require ('path');
  var zogFs = require ('zogFs');

  var zogModules = {};
  var zogModulesFiles = zogFs.ls (zogConfig.scriptsRoot, /zog.+\.js$/);

  zogModulesFiles.forEach (function (fileName)
  {
    //console.log(fileName);
    zogModules[fileName] = require (path.join (zogConfig.scriptsRoot,
                                               fileName));

    if(zogModules[fileName].hasOwnProperty('busCommands'))
    {
      zogModules[fileName].busCommands ().forEach(function(cmd) {
        console.log('command handler found in : %s, %s',fileName,cmd.name);
        var commandName = fileName.replace (/\.js$/, '') + '.' + cmd.name;
        busCommander.registerCommandHandler (commandName, cmd.handler);
      });
    }
  });
};


var emitter      = new EventEmitter ();
var notifier     = {};
//last action call, emit ready
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

exports.getEmitter  = emitter;

exports.getNotifier = function ()
{
  return notifier;
};

exports.getToken    = function ()
{
  return token;
};
exports.boot        = function ()
{
  zogLog.info ("Buses Booting...");
  //init all boot chain
  generateBusToken(function (genToken)
  {
    zogLog.info ('Bus token created: %s', genToken);
    token = genToken;
    loadCommandsRegistry();
    busCommander.start (zogConfig.bus.host,
                     parseInt (zogConfig.bus.commanderPort),
                     startNotifier());
  });

};

exports.stop      = function ()
{
  zogLog.info ('Buses end request');
  emitter.emit ('stop');
  busNotifier.stop ();
  busCommander.stop ();

};
