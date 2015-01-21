'use strict';

var Reflux = require ('reflux');
var xLog   = require ('xcraft-core-log')('xcraft-materials');
var xUtils = require ('xcraft-core-utils');

module.exports = function (busClient) {
  var commands = require ('./xcraftCommands.js');
  var events   = require ('./xcraftEvents.js');

  var commandStore  = Reflux.createStore ({
    init: function () {
      this.listenTo (commands.pacmanList, this._handlePacmanList);
    },
    _handlePacmanList: function () {
      this.trigger ('pacman.list');
    }
  });

  if (busClient) {
    xLog.verb ('Xcraft reaction listening using Xcraft-busclient...');
    commandStore.listen (function (cmd) {
      xLog.verb  (cmd + ' reaction send to bus: ');
      busClient.command.send (cmd);
    });

    busClient.subscriptions.on ('message', function (topic, msg) {
      var action;
      if (msg) {
        action = xUtils.topic2Action (topic);
        if (events[action]) {
          events[action] (msg.data);
        }
      }
    });
  } else {
    var ipc = require ('ipc');
    console.log ('Xcraft reaction listening using IPC...');

    ipc.send ('subscribe-event', 'pacman.list');
    ipc.send ('subscribe-event', 'activity.started');

    commandStore.listen(function (cmd) {
      console.log (cmd + ' reaction send to IPC');
      ipc.send ('send-cmd', cmd);
    });

    ipc.on('trigger-event', function (event) {
      events[event.name] (event.msg.data);
    });
  }
};
