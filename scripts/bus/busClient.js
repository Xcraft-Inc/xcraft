'use strict';

var moduleName = 'bus-client';

var zogConfig = require ('../zogConfig.js') ();
var zogLog    = require ('zogLog')(moduleName);
var axon      = require ('axon');
var async     = require ('async');

var subscriptions         = axon.socket ('sub');
var commands              = axon.socket ('push');
var eventsHandlerRegistry = {};


subscriptions.subscribe ("heartbeat");

subscriptions.on ('message', function (topic, msg)
{
  if (!eventsHandlerRegistry.hasOwnProperty (topic))
    return;

  zogLog.verb ('notification received: %s -> data: %s',
               topic,
               JSON.stringify (msg));
  eventsHandlerRegistry[topic] (msg);
});

exports.connect = function (callbackDone)
{
  async.parallel (
  [
    function (done)
    {
      subscriptions.on ('connect', function (err)
      {
        zogLog.verb ('Bus client subscribed to notifications bus');
        done ();
      });
    },
    function (done)
    {
      commands.on ('connect', function (err)
      {
        zogLog.verb ('Bus client ready to send on command bus');
        done ();
      });
    }
  ], function (err)
  {
    callbackDone (!err);
  });

  subscriptions.connect (parseInt (zogConfig.bus.notifierPort), zogConfig.bus.host);
  commands.connect (parseInt (zogConfig.bus.commanderPort), zogConfig.bus.host);
};

exports.events  =
{
  subscribe: function (topic, handler)
  {
    zogLog.verb ('client added handler to topic: ' + topic);

    subscriptions.subscribe (topic);
    eventsHandlerRegistry[topic] = handler;

  },

  send: function (topic, data)
  {
    var notifier   = require (zogConfig.busBoot).getNotifier ();
    var busMessage = require (zogConfig.busMessage) ();

    busMessage.data = data;
    notifier.send (topic, busMessage);

    zogLog.verb ('client send notification on topic:' + topic);
  }
};

exports.command =
{
  send: function (cmd, data, finishHandler)
  {
    if (finishHandler)
    {
      /* Subscribe to end command notification. */
      var finishTopic = cmd + '.finish';
      subscriptions.subscribe (finishTopic);
      eventsHandlerRegistry[finishTopic] = finishHandler;

      zogLog.verb ('finish handler registered for cmd: ' + cmd);
    }

    var busMessage = require (zogConfig.busMessage) ();

    busMessage.data = data;
    commands.send (cmd, busMessage);

    zogLog.verb ('client send \'%s\' command', cmd);
  }
};

exports.stop = function (callbackDone)
{
  async.parallel (
  [
    function (done)
    {
      subscriptions.on ('close', function (err)
      {
        done ();
      });
    },
    function (done)
    {
      commands.on ('close', function (err)
      {
        done ();
      });
    }
  ], function (err)
  {
      zogLog.verb ('Stopped');
      callbackDone (!err);
  });

  zogLog.verb ('Stopping...');
  subscriptions.close ();
  commands.close ();
};
