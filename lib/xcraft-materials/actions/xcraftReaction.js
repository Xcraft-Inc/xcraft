'use strict';

var Reflux        = require ('reflux');
var commands      = require ('./xcraftCommands.js');
var events        = require ('./xcraftEvents.js');
var ipc           = require ('ipc');

var reaction      = function () {
  console.debug ('xCraft reaction listening...');

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
};

module.exports = reaction;
