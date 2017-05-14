'use strict';

const path = require ('path');

var xBusClient = require ('xcraft-core-busclient');

var portalClient = null;
var cmd = {};

cmd.open = function (msg, response) {
  var match = msg.data.server.match (/([^:]+):([0-9]+):([0-9]+)/);

  var busConfig = {
    host: match[1],
    commanderPort: match[2],
    notifierPort: match[3],
  };

  portalClient = new xBusClient.BusClient (busConfig);
  portalClient.connect (null, function () {
    response.log.info ('connected with ' + portalClient.getOrcName ());
    response.events.send ('portal.open.finished');
  });
};

cmd.close = function (msg, response) {
  portalClient.stop (function () {
    response.events.send ('portal.close.finished');
  });

  portalClient = null;
};

cmd.send = function (msg, response) {
  if (!portalClient) {
    response.log.warn ('the portal is closed');
    response.events.send ('portal.send.finished');
    return;
  }

  portalClient.command.send (msg.data.command);
  response.events.send ('portal.send.finished');
};

/**
 * Retrieve the list of available commands.
 *
 * @returns {Object} The list and definitions of commands.
 */
exports.xcraftCommands = function () {
  const xUtils = require ('xcraft-core-utils');
  return {
    handlers: cmd,
    rc: xUtils.json.fromFile (path.join (__dirname, './rc.json')),
  };
};
