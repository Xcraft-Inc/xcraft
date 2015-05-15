'use strict';

var moduleName = 'portal';

var path = require ('path');

var xLog       = require ('xcraft-core-log') (moduleName);
var xBusClient = require ('xcraft-core-busclient');
var busClient  = xBusClient.global;

var portalClient = null;
var cmd = {};


cmd.open = function (msg) {
  var match = msg.data.server.match (/([^:]+):([0-9]+):([0-9]+)/);

  var busConfig = {
    host:          match[1],
    commanderPort: match[2],
    notifierPort:  match[3]
  };

  portalClient = new xBusClient.BusClient (busConfig);
  portalClient.connect (null, function () {
    xLog.info ('connected with ' + portalClient.getOrcName ());
    busClient.events.send ('portal.open.finished');
  });
};

cmd.close = function () {
  portalClient.stop (function () {
    busClient.events.send ('portal.close.finished');
  });

  portalClient = null;
};

cmd.send = function (msg) {
  if (!portalClient) {
    xLog.warn ('the portal is closed');
    busClient.events.send ('portal.send.finished');
    return;
  }

  portalClient.command.send (msg.data.command);
  busClient.events.send ('portal.send.finished');
};

/**
 * Retrieve the list of available commands.
 *
 * @returns {Object} The list and definitions of commands.
 */
exports.xcraftCommands = function () {
  return {
    handlers: cmd,
    rc: path.join (__dirname, './rc.json')
  };
};
