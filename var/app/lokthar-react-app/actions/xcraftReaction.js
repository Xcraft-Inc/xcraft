'use strict';

var Reflux        = require ('reflux');
var remote        = require ('remote');
var busClient     = remote.require ('xcraft-core-busclient');
var commands      = require ('./xcraftCommands.js');
var events        = require ('./xcraftEvents.js');

var reaction      = function () {
  console.debug ('xCraft reaction listening...');
  var commandStore  = Reflux.createStore({
    init: function () {
      this.listenTo(commands.pacmanList, this._handlePacmanList);
    },
    _handlePacmanList: function () {
      this.trigger('pacman.list');
    }
  });

  commandStore.listen(function (cmd) {
    console.debug  (cmd + 'reaction send to bus: ');
    busClient.command.send (cmd);
  });

  busClient.events.subscribe ('pacman.list', function (msg) {
    console.debug  ('pacman.list reaction received from bus');
    events.pacmanList (msg.data);
  });

  busClient.events.subscribe ('activity.started', function (msg) {
    console.debug ('activity.started reaction received from bus');
    events.activityStarted (msg.data);
  });
};

module.exports = reaction;
