/* Command Bus Service */
'use strict';

var moduleName = 'command-bus';
var zogConfig  = require ('../zogConfig.js') ();
var zogLog     = require ('zogLog') (moduleName);

var axon       = require ('axon');
var sock       = axon.socket ('pull');
var token      = 'invalid';
var commandsRegistry = {};

module.exports = function ()
{
  return {
    bus   : sock,
    start : function (host, port, busToken, callback)
    {
      //save token
      token = busToken;

      //create domain for catching port binding errors
      var d = require('domain').create();

      //error management
      d.on('error', function(err){
        zogLog.warn ('Bus already started on %s:%d', host, port);
      });

      //try binding in domain
      d.run(function(){
        sock.bind (parseInt(port), host, callback);
        zogLog.verb ('Bus started on %s:%d', host, port);
      });

    },
    stop : function ()
    {
      sock.close ();
    },

    registerCommandHandler : function (commandKey, handlerFunction)
    {
      zogLog.verb ('Command \'%s\' registered', commandKey);

      commandsRegistry[commandKey] = handlerFunction;
    }
  };
};

sock.on ('message', function (cmd, msg)
{
  zogLog.verb ('command received: %s -> msg:%s',
               cmd,
               JSON.stringify (msg));
  //call handler
  if(msg.token == token)
  {
    commandsRegistry[cmd](msg);
  }
  else
  {
    zogLog.verb ('invalid token, command dicarded');
  }

});
