'use strict';

var zogConfig     = require ('../zogConfig.js') ();
var async         = require('async');
var axon          = require('axon');
var notifications = axon.socket('sub');
var commands      = axon.socket('push');
var buses         = require('./busboot');

buses.on('ready', function() {
  commands.connect (parseInt(zogConfig.bus.commanderPort), zogConfig.bus.host);
  commands.send('zog',{key: 'value'});
  notifications.connect (parseInt(zogConfig.bus.notifierPort), zogConfig.bus.host);
  notifications.subscribe ('heartbeat');

  notifications.on ('message', function(topic, msg){
    console.log(topic + ': ' + msg.toString());
  });

});

buses.boot();
