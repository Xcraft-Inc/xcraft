//Buses Booting
'use strict';

var moduleName   = 'notification-bus';
var zogConfig    = require ('../zogConfig.js') ();
var zogLog       = require ('zogLog') (moduleName);
var async        = require ('async');
var busTester    = require ('./busTester.js');
var notifier     = require ('./busNotifier.js') ();
var commander    = require ('./busCommander.js') ();

var EventEmitter    = require('events').EventEmitter;
module.exports      = new EventEmitter();
module.exports.boot = function ()
{
  var startNotifier = function ()
  {
    notifier.start (zogConfig.bus.host, zogConfig.bus.notifierPort, module.exports.emit ('ready'));
  };

  commander.start (zogConfig.bus.host, zogConfig.bus.commanderPort, startNotifier());

}
