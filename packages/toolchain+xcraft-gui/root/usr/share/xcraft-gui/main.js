'use strict';

var app           = require ('app');
var ipc           = require ('ipc');
var BrowserWindow = require ('browser-window');
var busClient     = require ('xcraft-core-busclient');

// Report crashes to our server.
require('crash-reporter').start();
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;

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

app.on('ready', function () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 960, height: 600, frame: false});

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;

    busClient.events.subscribe ('disconnected', function (msg) { /* jshint ignore:line */
      busClient.stop (function () {
        app.quit ();
      });
    });

    busClient.command.send ('shutdown');
  });

  busClient.connect (null, function (err) {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    // and load the index.html of the app.
    mainWindow.loadUrl('file://' + __dirname + '/index.html');
  });
});
