'use strict';

var xBusClient = require('xcraft-core-busclient');

var portalClient = null;
var cmd = {};

cmd.open = function(msg, resp) {
  var match = msg.data.server.match(/([^:]+):([0-9]+):([0-9]+)/);

  var busConfig = {
    host: match[1],
    commanderPort: match[2],
    notifierPort: match[3],
  };

  portalClient = new xBusClient.BusClient(busConfig);
  portalClient.connect(null, function() {
    resp.log.info('connected with ' + portalClient.getOrcName());
    resp.events.send(`portal.open.${msg.id}.finished`);
  });
};

cmd.close = function(msg, resp) {
  portalClient.stop(function() {
    resp.events.send(`portal.close.${msg.id}.finished`);
  });

  portalClient = null;
};

cmd.send = function(msg, resp) {
  if (!portalClient) {
    resp.log.warn('the portal is closed');
    resp.events.send(`portal.send.${msg.id}.finished`);
    return;
  }

  portalClient.command.send(msg.data.command);
  resp.events.send(`portal.send.${msg.id}.finished`);
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
