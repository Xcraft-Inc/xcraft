//Notification Bus Service
'use strict';

var moduleName = 'notification-bus';
var zogConfig  = require ('../zogConfig.js') ();
var zogLog     = require ('zogLog') (moduleName);
var async      = require ('async');
var axon       = require ('axon');
var sock       = axon.socket ('pub');

module.exports = function ()
{
  return {
    bus   : sock,
    start : function (host, port, callback)
    {
      sock.bind (parseInt(port), host, callback);
      zogLog.info ('Notification bus started on %s:%d', host, port);
      setInterval(function() {
        sock.send('heartbeat','notification bus running');
      }, 1000);
    }
  }
}
