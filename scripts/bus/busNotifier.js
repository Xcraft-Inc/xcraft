//Notification Bus Service

'use strict';

var moduleName = 'notification-bus';
var zogConfig = require ('../zogConfig.js') ();
var zogLog    = require ('zogLog') (moduleName);
var async     = require('async');
var axon      = require('axon');


var sock = axon.socket('pub');

sock.bind(zogConfig.busNotifierPort);
console.log('push server started');

setInterval(function(){
  sock.send('test',{data: 'test data'});
}, 150);
