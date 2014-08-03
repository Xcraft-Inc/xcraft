//Command Bus Service
'use strict';

var moduleName = 'command-bus';
var zogConfig  = require ('../zogConfig.js') ();
var zogLog     = require ('zogLog') (moduleName);

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
};

sock.on('message', function(cmd, data) {
  zogLog.info ('command received: %s -> data:%s',
                cmd,
                JSON.stringify(data,' ',0));
  //TODO: handle commands
});
