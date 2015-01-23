'use strict';

var app           = require ('app');
var ipc           = require ('ipc');
var BrowserWindow = require ('browser-window');
var busClient     = require ('xcraft-core-busclient');
var xUtils        = require ('xcraft-core-utils');
var desktop    = null;
var appWindows = {};
var windex = 0; // WindowIndex

ipc.on ('start-app', function (event, appUrl) {
  appWindows[windex] = new BrowserWindow({width: 960, height: 600, frame: false});
  appWindows[windex].loadUrl('file://' + __dirname + '/../xcraft-gui/index.html');
  appWindows[windex].on ('closed', function () {
    appWindows[windex] = null;
  });
  appWindows[windex].windex = windex;
  windex++;
});

app.on ('ready', function () {
  var loadDesktop = function () {
    console.log ('opening goblin desktop');
    desktop = new BrowserWindow({width: 960, height: 600, kiosk: true, fullscreen: true});
    desktop.loadUrl('file://' + __dirname + '/index.html');
    desktop.on('closed', function () {
      busClient.events.subscribe ('disconnected', function (msg) { /* jshint ignore:line */
        busClient.stop (function () {
          desktop = null;
        });
      });
      // busClient.command.send ('shutdown');
    });
  };
  console.log ('Waiting for zog daemon...');
  busClient.connect (null, function (err) {
    if (err) {
      console.error (err);
      process.exit(1);
    }
    console.log ('Connected to zog daemon!');
    ipc.on ('subscribe-event', function (event, topic) {
      busClient.events.subscribe (topic, function (msg) {
        var action = xUtils.topic2Action (topic);
        var receivedEvent = {
          name: action,
          msg: msg
        };
        event.sender.send ('trigger-event', receivedEvent);
      });
    });

    ipc.on ('send-cmd', function (event, command) {
      busClient.command.send (command);
    });

    loadDesktop ();
  });
});
