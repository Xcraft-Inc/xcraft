//Notification Bus Service
'use strict';

var moduleName = 'notification-bus';
var zogConfig  = require ('../zogConfig.js') ();
var zogLog     = require ('zogLog') (moduleName);

var async      = require ('async');
var axon       = require ('axon');
var sock       = axon.socket ('pub');
var heartbeatPulsor = null;

sock.on ('socket error',function (err){
  console.log(err);
});

module.exports = function ()
{
  return {
    bus   : sock,
    start : function (host, port, callback)
    {
      //create domain for catching port binding errors
      var d = require('domain').create();

      //error management
      d.on('error', function(err){
        zogLog.info('Notification bus already started on %s:%d', host, port);
      });

      //try binding in domain
      d.run(function(){
        sock.bind (parseInt (port), host, callback);
        zogLog.info ('Notification bus started on %s:%d', host, port);
      });

      heartbeatPulsor = setInterval (function()
      {
        sock.send ('heartbeat','notification bus running');
      }, 1000);
    },
    stop : function ()
    {
      clearInterval (heartbeatPulsor);
      sock.close ();
    }
  };
};
