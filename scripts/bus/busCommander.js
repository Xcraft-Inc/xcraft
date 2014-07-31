//Command Bus Service
'use strict';

var moduleName = 'command-bus';
var zogConfig  = require ('../zogConfig.js') ();
var zogLog     = require ('zogLog') (moduleName);
var async      = require ('async');
var axon       = require ('axon');
var sock       = axon.socket ('pull');

module.exports = function ()
{
  return {
    bus   : sock,
    start : function (host, port, callback)
    {
      sock.bind (parseInt(port), host, callback);
      zogLog.info ('Command bus started on %s:%d', host, port);
    }
  }
}

sock.on('message', function(msg){
  zogLog.info ('command received: %s',JSON.stringify(msg,' ',0));
  //TODO: handle commands

});
