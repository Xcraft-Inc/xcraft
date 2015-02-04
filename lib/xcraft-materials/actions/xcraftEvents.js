'use strict';

var Reflux = require ('reflux');
var xFs    = require ('xcraft-core-fs');
var path   = require ('path');

var modules = [];
var eventsDeps = [];

var loadStoreEventDependencies = function () {
  var modulePath   = path.join (__dirname, '../stores');
  var filterRegex  = /store\.js$/;
  var modulesFiles = xFs.ls (modulePath, filterRegex);
  modulesFiles.forEach (function (fileName) {
    modules[fileName] = require (path.join (modulePath, fileName));
    if (modules[fileName].hasOwnProperty ('eventDependencies')) {
      modules[fileName].eventDependencies.forEach (function (dep) {
        eventsDeps.push (dep.eventName);
      });
    }
  });
};

loadStoreEventDependencies ();
module.exports = Reflux.createActions(eventsDeps);
