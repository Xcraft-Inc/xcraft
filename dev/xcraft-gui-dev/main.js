'use strict';

var ipc           = require ('ipc');
var BrowserWindow = require ('browser-window');
var busClient     = require ('xcraft-bus-client');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;
// Create the browser window.
mainWindow = new BrowserWindow({width: 960, height: 600, frame: false});

// Emitted when the window is closed.
mainWindow.on('closed', function () {
  console.log ('main window closed');
  mainWindow = null;
});

mainWindow.loadUrl('file://' + __dirname + '/index.html');

ipc.on('open-console', function (event, arg) { // jshint ignore:line
  BrowserWindow.getFocusedWindow().toggleDevTools();
});

ipc.on('minimize', function (event, arg) { // jshint ignore:line
  mainWindow.minimize();
});

ipc.on('unmaximize', function (event, arg) { // jshint ignore:line
  mainWindow.unmaximize();
});

ipc.on('maximize', function (event, arg) { // jshint ignore:line
  mainWindow.maximize();
});

ipc.on('close-app', function (event, arg) { // jshint ignore:line
  mainWindow.emit ('closed');
});
