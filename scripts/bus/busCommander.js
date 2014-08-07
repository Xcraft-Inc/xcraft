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

      /* Create domain in order to catch port binding errors. */
      var domain = require ('domain').create ();

      domain.on ('error', function (err)
      {
        zogLog.warn ('Bus already started on %s:%d', host, port);
      });

      /* Try binding in domain. */
      domain.run (function ()
      {
        sock.bind (parseInt (port), host, callback);
        zogLog.verb ('Bus started on %s:%d', host, port);
      });
    },

    stop: function ()
    {
      sock.close ();
    },

    registerCommandHandler: function (commandKey, handlerFunction)
    {
      zogLog.verb ('Command \'%s\' registered', commandKey);

      commandsRegistry[commandKey] = handlerFunction;
    }
  };
};

sock.on ('message', function (cmd, msg)
{
  zogLog.info ('begin command: %s', cmd);
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
