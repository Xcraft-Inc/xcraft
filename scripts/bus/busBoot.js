/* Buses Booting */
'use strict';

var moduleName   = 'notification-bus';
var zogConfig    = require ('../zogConfig.js') ();
var zogLog       = require ('zogLog') (moduleName);

var notifier     = require ('./busNotifier.js') ();
var commander    = require ('./busCommander.js') ();

var EventEmitter    = require ('events').EventEmitter;
module.exports      = new EventEmitter ();
module.exports.boot = function ()
{
  zogLog.info ("Buses Booting...");

  //last action call, emit ready
  var startNotifier = function ()
  {
    notifier.start (zogConfig.bus.host,
                    parseInt (zogConfig.bus.notifierPort),
                    module.exports.emit ('ready'));
  };

  //browse /scripts for zog modules, and register busCommands
  var loadCommandRegistry = function ()
  {
    var path  = require ('path');
    var zogFs = require ('zogFs');

    var zogModules = {};
    var zogModulesFiles = zogFs.ls (zogConfig.scriptsRoot, /\zog.*(.js$)/);

    zogModulesFiles.forEach (function (fileName)
    {
      //console.log(fileName);
      if(fileName !== 'zog.js')
      {
        zogModules[fileName] = require (path.join (zogConfig.scriptsRoot,
                                                   fileName));

        if(zogModules[fileName].hasOwnProperty('busCommands'))
        {
          zogModules[fileName].busCommands ().forEach(function(handler) {
            //console.log('command handler found in : %s, %s',fileName,handler);
            var commandName = fileName.replace (/\.js$/, '') + '-' + handler;
            commander.registerCommandHandler (commandName, handler);
          });
        }

      }
    });

    //start notifier bus, at this point command bus is ready
    startNotifier();
  };

  //init all
  commander.start (zogConfig.bus.host,
                   parseInt (zogConfig.bus.commanderPort),
                   loadCommandRegistry ());
};
