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
  zogLog.info ("Buses Booting...")
  var startNotifier = function ()
  {
    notifier.start (zogConfig.bus.host, parseInt (zogConfig.bus.notifierPort), module.exports.emit ('ready'));
  };

  commander.start (zogConfig.bus.host, parseInt (zogConfig.bus.commanderPort), startNotifier ());
};
