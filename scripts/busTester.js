'use strict';

var zogConfig     = require ('./zogConfig.js') ();
var axon          = require ('axon');
var notifications = axon.socket ('sub');
var commands      = axon.socket ('push');
var testBuses     = require ('xcraft-core-bus');

testBuses.getEmitter.on ('ready', function () {
  /* command bus tester */
  commands.connect (parseInt (zogConfig.bus.commanderPort), zogConfig.bus.host);
  commands.send ('zogManager.list');

  /* notification bus tester */
  notifications.connect (parseInt (zogConfig.bus.notifierPort), zogConfig.bus.host);
  notifications.subscribe ('heartbeat');
  notifications.on ('message', function (topic, msg) {
    console.log (topic + ': ' + msg.toString ());
  });
});

/* init */
testBuses.boot (zogConfig.bus);
