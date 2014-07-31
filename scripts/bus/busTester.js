'use strict';

var zogConfig = require ('../zogConfig.js') ();
var async     = require('async');
var axon      = require('axon');
var sock      = axon.socket('sub');
var buses     = require('./busboot');

buses.on('ready', function() {
  console.log('buses are ready');
  sock.connect(zogConfig.bus.notifierPort, zogConfig.bus.host);
  sock.subscribe('heartbeat');

  sock.on('message', function(topic, msg){
    console.log(topic + ': ' + msg.toString());
  });

});

buses.boot();
