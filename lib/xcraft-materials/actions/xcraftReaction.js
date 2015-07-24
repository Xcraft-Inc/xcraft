'use strict';

var moduleName = 'materials';

var xLog   = require ('xcraft-core-log') (moduleName);
var xUtils = require ('xcraft-core-utils');


var listenerAxon = function (commands, events, busClient) {
  xLog.verb ('Xcraft reaction listening using Xcraft-busclient...');

  commands.send.listen (function (cmdData) {
    xLog.verb (cmdData.cmd + ' reaction send to bus: ');
    busClient.command.send (cmdData.cmd);
  });

  busClient.events.catchAll (function (topic, msg) {
    if (!msg) {
      return;
    }

    var action;
    topic = topic.replace (/[^:]*::/, '');
    action = xUtils.string.camelcasify (topic);
    if (events[action]) {
      events[action] (msg.data);
    }
  });
};

var listenerIpc = function (commands, events) {
  var ipc = require ('ipc');

  console.log ('Xcraft reaction listening using IPC...');

  commands.send.listen (function (cmdData) {
    console.log (cmdData.cmd + ' reaction send to IPC');
    ipc.send ('send-cmd', cmdData.cmd);
  });

  ipc.on ('trigger-event', function (event) {
    events[event.name] (event.msg.data);
  });
};

module.exports = function (busClient) {
  var commands = require ('./xcraftCommands.js');
  var events;

  if (busClient) {
    events = require ('./xcraftEvents.js');
    listenerAxon (commands, events, busClient);
  } else {
    events = require ('./xcraftEvents.js');
    listenerIpc (commands, events);
  }
};
