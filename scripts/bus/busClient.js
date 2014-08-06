'use strict';

var zogConfig     = require ('../zogConfig.js') ();
var axon          = require ('axon');
var async         = require ('async');

var subscriptions = axon.socket ('sub');
var commands      = axon.socket ('push');
var eventsHandlerRegistry = {};

exports.connect = function(callbackDone)
{

  async.parallel([
    function (done)
    {
      subscriptions.on('connect', function (err) {
        console.log('sub con');
        done();
      });
    },
    function (done)
    {
      commands.on('connect', function (err) {
        console.log('cmd con');
        done();
      });
    }
    ],
    function (err){
      callbackDone(!err);
    });

    subscriptions.connect (parseInt (zogConfig.bus.notifierPort), zogConfig.bus.host);
    commands.connect (parseInt (zogConfig.bus.commanderPort), zogConfig.bus.host);

};




//subscriptions.subscribe("heartbeat");

subscriptions.on ('message', function (topic, msg) {
  console.log(topic + '    msg:' + msg);
  if(eventsHandlerRegistry.hasOwnProperty(topic))
  {
    console.log('call registry for handler :' + topic);
    eventsHandlerRegistry[topic](msg);
  }

});


exports.events  =
{
  subscribe : function (topic, handler)
  {
    console.log('client subscribed to : ' + topic);
    subscriptions.subscribe(topic);
    eventsHandlerRegistry[topic] = handler;

  },
  send      : function (topic, data)
  {
    var notifier      = require (zogConfig.busBoot).getNotifier();
    var busMessage    = require (zogConfig.busMessage)();
    busMessage.data   = data;
    notifier.send (topic, busMessage);
    console.log('send notify :' + topic);
  }
};

exports.command =
{
  send      : function (cmd, data, finishHandler)
  {
    if(finishHandler)
    {
      //subscribe to end cmd notification
      var finishTopic = cmd + '.finish';
      subscriptions.subscribe(finishTopic);
      eventsHandlerRegistry[finishTopic] = finishHandler;
      console.log('finish handler sub');
    }

    var busMessage    = require (zogConfig.busMessage)();
    busMessage.data   = data;
    commands.send (cmd, busMessage);
    console.log('cmd send' + cmd);
  }
};

exports.stop = function ()
{
  console.log ('Bus Client end request');
  subscriptions.close ();
  commands.close ();
};
