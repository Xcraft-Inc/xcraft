//Link relative zogConfig lib
var zogConfig     = require ('../../scripts/zogConfig.js')();
var app           = require ('app');
var ipc           = require ('ipc');
var shell         = require ('shell');
var BrowserWindow = require ('browser-window');
var async         = require ('async');
var zogLog        = require ('zogLog')('lokthar').color(false);
var busClient     = require (zogConfig.busClient);
// Report crashes to our server.
require('crash-reporter').start();
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;

ipc.on('open-console', function(event, arg) {
  BrowserWindow.getFocusedWindow().toggleDevTools();
});

ipc.on('create-package', function(event, arg) {
  var pkgCreate = require (zogConfig.libPkgCreate);
  pkgCreate.pkgTemplate (arg);
});

ipc.on('minimize', function(event, arg) {
  mainWindow.minimize();
});

ipc.on('unmaximize', function(event, arg) {
  mainWindow.unmaximize();
});

ipc.on('maximize', function(event, arg) {
  mainWindow.maximize();
});

ipc.on('close-app', function(event, arg) {
  busClient.stop (function(done){
    app.quit ();
  });
});

app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 960, height: 600,frame: false});

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    busClient.stop (function(done){
      app.quit ();
      mainWindow = null;
    });

  });


  busClient.connect(function (done) {
    if(!done)
      process.exit(1);

    // and load the index.html of the app.
    mainWindow.loadUrl('file://' + __dirname + '/index.html')

  });

});
