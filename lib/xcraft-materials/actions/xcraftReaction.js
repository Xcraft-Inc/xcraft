'use strict';

var Reflux        = require ('reflux');

module.exports = function (busClient) {
  var commands      = require ('./xcraftCommands.js');
  var events        = require ('./xcraftEvents.js');
  if (busClient) {
    console.debug ('xCraft reaction listening using Xcraft-busclient...');
  } else {
    var ipc         = require ('ipc');
    console.debug ('xCraft reaction listening using IPC...');

    ipc.send ('subscribe-event', 'pacman.list');
    ipc.send ('subscribe-event', 'activity.started');

    var commandStore  = Reflux.createStore({
      init: function () {
        this.listenTo(commands.pacmanList, this._handlePacmanList);
      },
      _handlePacmanList: function () {
        this.trigger('pacman.list');
      }
    });

    commandStore.listen(function (cmd) {
      console.debug  (cmd + ' reaction send to bus: ');
      ipc.send ('send-cmd', cmd);
    });

    ipc.on('trigger-event', function (event) {
      events[event.name] (event.msg.data);
    });
  }
};
