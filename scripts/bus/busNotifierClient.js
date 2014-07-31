'use strict';

var zogConfig = require ('../zogConfig.js') ();
var async     = require('async');
var axon      = require('axon');


var sock = axon.socket('sub');

sock.connect(zogConfig.bus.notifierPort, zogConfig.bus.host);
sock.subscribe('test');

sock.on('message', function(topic, msg){
  console.log(topic + ': ' + msg);
});
