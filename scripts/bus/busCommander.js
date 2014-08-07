/* Command Bus Service */
'use strict';

var moduleName = 'command-bus';

var zogConfig  = require ('../zogConfig.js') ();
var zogLog     = require ('zogLog') (moduleName);
var axon       = require ('axon');

var sock = axon.socket ('pull');
var commandsRegistry = {};


module.exports = function ()
{
  return {
    bus  : sock,
    start: function (host, port, callback)
    {
      /* Create domain in order to catch port binding errors. */
      var domain = require ('domain').create ();

      domain.on ('error', function (err)
      {
        zogLog.warn ('bus running on %s:%d, error: %s', host, port, err.message);
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
    },

    registerErrorHandler: function (errorHandler)
    {
      commandsRegistry['error'] = errorHandler;
    }
  };
};

sock.on ('message', function (cmd, data)
{
  zogLog.info ('begin command: %s', cmd);
  zogLog.verb ('command received: %s -> data: %s', cmd, JSON.stringify (data));

  if (!commandsRegistry.hasOwnProperty (cmd))
  {
    zogLog.err ('the command "%s" is not available', cmd);
    cmd = 'error';
  }

  /* call handler */
  commandsRegistry[cmd] (data);
});
