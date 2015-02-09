'use strict';

var app           = require ('app');
var ipc           = require ('ipc');
var BrowserWindow = require ('browser-window');
var busClient     = require ('xcraft-core-busclient');
var xUtils        = require ('xcraft-core-utils');
var desktop    = null;
var appWindows = {};
var windex = 0; // WindowIndex

ipc.on ('start-app', function () {
  appWindows[windex] = new BrowserWindow({width: 960, height: 600, frame: false});
  appWindows[windex].loadUrl('file://' + __dirname + '/../xcraft-gui/index.html');
  appWindows[windex].on ('closed', function () {
    appWindows[windex] = null;
  });
  appWindows[windex].windex = windex;
  windex++;
});


ipc.on ('exit', function () {
  Object.keys (appWindows).forEach ( function (window) {
    window.close ();
    window = null;
  });
});

app.on ('ready', function () {
  var loadDesktop = function () {
    console.log ('opening goblin desktop');
    desktop = new BrowserWindow({width: 960, height: 600, kiosk: false, fullscreen: true});
    desktop.toggleDevTools();
    desktop.loadUrl('file://' + __dirname + '/index.html');
    desktop.on('closed', function () {
      desktop = null;
      busClient.stop (function () {
        app.quit ();
      });
    });
  };
  console.log ('Waiting for zog daemon...');
  busClient.connect (null, function (err) {
    if (err) {
      console.error (err);
      process.exit(1);
    }
    console.log ('Connected to zog daemon!');

    busClient.subscriptions.on ('message', function (topic, msg) {
      var action;
      if (msg) {
        action = xUtils.topic2Action (topic);
        var receivedEvent = {
          name: action,
          msg: msg
        };
        event.sender.send ('trigger-event', receivedEvent);
      }
    });

    ipc.on ('send-cmd', function (event, command) {
      busClient.command.send (command);
    });

    loadDesktop ();
  });
});
