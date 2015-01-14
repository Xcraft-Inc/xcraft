'use strict';

var app           = require ('app');
var path          = require ('path');
var ipc           = require ('ipc');
var BrowserWindow = require ('browser-window');
var busClient     = require ('xcraft-core-busclient');

var desktop    = null;
var appWindows = {};
var windex = 0; // WindowIndex

ipc.on ('start-app', function () {
  appWindows[windex] = new BrowserWindow({width: 960, height: 600, frame: false});
  appWindows[windex].loadUrl('file://' + __dirname + '/../xcraft-gui-dev/index.html');
  appWindows[windex].on ('closed', function () {
    appWindows[windex] = null;
  });
  appWindows[windex].windex = windex;
  windex++;
});

app.on ('ready', function () {
  desktop = new BrowserWindow({width: 960, height: 600, frame: true});
  desktop.loadUrl('file://' + __dirname + '/index.html');
  desktop.on('closed', function () {
    desktop = null;
  });
});
