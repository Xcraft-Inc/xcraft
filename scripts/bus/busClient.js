'use strict';

var zogConfig     = require ('../zogConfig.js') ();
var axon          = require ('axon');


module.exports = function ()
{
  var notifications = axon.socket ('sub');
  notifications.connect (parseInt (zogConfig.bus.notifierPort), zogConfig.bus.host);

  var commands      = axon.socket ('push');
  commands.connect (parseInt (zogConfig.bus.commanderPort), zogConfig.bus.host);
  return {
    notificationBus : notifications,
    commandBus      : commands,
  };
};
