'use strict';

const path = require('path');

var xBusClient = require('xcraft-core-busclient');

var portalClient = null;
var cmd = {};

cmd.open = function(msg, response) {
  var match = msg.data.server.match(/([^:]+):([0-9]+):([0-9]+)/);

  var busConfig = {
    host: match[1],
    commanderPort: match[2],
    notifierPort: match[3],
  };

  portalClient = new xBusClient.BusClient(busConfig);
  portalClient.connect(null, function() {
    response.log.info('connected with ' + portalClient.getOrcName());
    response.events.send(`portal.open.${msg.id}.finished`);
  });
};

cmd.close = function(msg, response) {
  portalClient.stop(function() {
    response.events.send(`portal.close.${msg.id}.finished`);
  });

  portalClient = null;
};

cmd.send = function(msg, response) {
  if (!portalClient) {
    response.log.warn('the portal is closed');
    response.events.send(`portal.send.${msg.id}.finished`);
    return;
  }

  portalClient.command.send(msg.data.command);
  response.events.send(`portal.send.${msg.id}.finished`);
};

/**
 * Retrieve the list of available commands.
 *
 * @returns {Object} The list and definitions of commands.
 */
exports.xcraftCommands = function() {
  return {
    handlers: cmd,
    rc: {
      open: {
        desc: 'open the portal',
        options: {
          scope: 'portal',
          params: {
            required: 'server',
          },
        },
      },
      close: {
        desc: 'close the portal',
        options: {
          scope: 'portal',
        },
      },
      send: {
        desc: 'send a command in the portal',
        options: {
          scope: 'portal',
          params: {
            required: 'command',
          },
        },
      },
    },
  };
};
