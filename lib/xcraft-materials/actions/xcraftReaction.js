'use strict';

var Reflux        = require ('reflux');
var xLog          = require ('xcraft-core-log')('xcraft-materials');
module.exports = function (busClient) {
  var commands      = require ('./xcraftCommands.js');
  var events        = require ('./xcraftEvents.js');

  var commandStore  = Reflux.createStore({
    init: function () {
      this.listenTo(commands.pacmanList, this._handlePacmanList);
    },
    _handlePacmanList: function () {
      this.trigger('pacman.list');
    }
  });

  if (busClient) {
    xLog.verb ('xCraft reaction listening using Xcraft-busclient...');
    commandStore.listen(function (cmd) {
      xLog.verb  (cmd + ' reaction send to bus: ');
      busClient.command.send (cmd);
    });

    busClient.events.subscribe ('pacman.list', function (msg) {
      xLog.verb  ('pacman.list reaction received from bus');
      events.pacmanList (msg.data);
    });

    busClient.events.subscribe ('activity.started', function (msg) {
      xLog.verb ('activity.started reaction received from bus');
      events.activityStarted (msg.data);
    });
  } else {
    var ipc         = require ('ipc');
    console.log ('xCraft reaction listening using IPC...');

    ipc.send ('subscribe-event', 'pacman.list');
    ipc.send ('subscribe-event', 'activity.started');

    commandStore.listen(function (cmd) {
      console.log  (cmd + ' reaction send to ipc: ');
      ipc.send ('send-cmd', cmd);
    });

    ipc.on('trigger-event', function (event) {
      events[event.name] (event.msg.data);
    });
  }
};
