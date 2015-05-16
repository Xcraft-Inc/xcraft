'use strict';

var app           = require ('app');
var ipc           = require ('ipc');
var BrowserWindow = require ('browser-window');
var busClient     = require ('xcraft-core-busclient').global;
var xUtils        = require ('xcraft-core-utils');
var desktop    = null;
var appWindows = [];
var windex = 0; // WindowIndex

ipc.on ('start-app', function () {
  appWindows[windex] = new BrowserWindow({width: 960, height: 600, frame: false});
  appWindows[windex].loadUrl ('file://' + __dirname + '/../xcraft-gui/index.html');
  appWindows[windex].toggleDevTools ();
  appWindows[windex].windex = windex;
  windex++;
});


ipc.on ('exit', function () {
  appWindows.forEach ( function (window) {
    window.close ();
  });
});

app.on ('ready', function () {
  var loadDesktop = function () {
    console.log ('opening goblin desktop');
    desktop = new BrowserWindow({width: 960, height: 600, kiosk: false, fullscreen: true});
    desktop.toggleDevTools ();
    desktop.loadUrl ('file://' + __dirname + '/index.html');
    desktop.on ('closed', function () {
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
      process.exit (1);
    }
    console.log ('Connected to zog daemon!');

    busClient.events.catchAll (function (topic, msg) {
      var action;
      if (msg) {
        topic = topic.replace (/[^:]*::/, '');
        action = xUtils.topic2Action (topic);
        var receivedEvent = {
          name: action,
          msg: msg
        };
        if (topic !== 'heartbeat') {
          console.log ('GOBLIN EVENT COMMING:' + JSON.stringify (receivedEvent));
          appWindows.forEach ( function (window) {
            if (window !== null) {
              if (window.webContents !== null) {
                console.log ('Event sent to window: ' + window.windex);
                window.webContents.send ('trigger-event', receivedEvent);
              } else {
                console.log ('Closed window removed');
                appWindows.splice (window.windex, 1);
              }
            }
          });
        }
      }
    });

    ipc.on ('send-cmd', function (event, command) {
      console.log ('GOBLIN SEND COMMAND:' + JSON.stringify (command));
      busClient.command.send (command);
    });

    loadDesktop ();
  });
});
