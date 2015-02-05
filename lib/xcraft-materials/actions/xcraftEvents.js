'use strict';

var reflux = require ('reflux');
var xFs    = require ('xcraft-core-fs');
var path   = require ('path');

var modules = [];
var eventsDeps = [];


var loadStoreEventDependencies = function () {
  var modulePath   = path.join (__dirname, '../stores');
  var filterRegex  = /store\.js$/;
  var modulesFiles = xFs.ls (modulePath, filterRegex);

  modulesFiles.forEach (function (fileName) {
<<<<<<< HEAD
    modules[fileName] = require (path.join (modulePath, fileName))();
=======
    modules[fileName] = require (path.join (modulePath, fileName));

>>>>>>> f8db2735dd3e78be1bac7d5b083f793e70d90da2
    if (modules[fileName].hasOwnProperty ('eventDependencies')) {
      modules[fileName].eventDependencies.forEach (function (dep) {
        eventsDeps.push (dep.eventName);
      });
    }
  });
};

<<<<<<< HEAD
/* WebPack resolving method */
var loadStoreEventDependencies4Web = function () {
  var req = require.context('../stores/', false, /store\.js$/);
  req.keys().forEach (function (storeDep) {
    var store = req.resolve (storeDep);
    if (store.hasOwnProperty ('eventDependencies')) {
      store.eventDependencies.forEach (function (dep) {
        eventsDeps.push (dep.eventName);
      });
    }
  });
};


module.exports = function (isWeb) {
  if (isWeb) {
    loadStoreEventDependencies4Web ();
  } else {
    loadStoreEventDependencies ();
  }
  return Reflux.createActions(eventsDeps);
};
=======
loadStoreEventDependencies ();
module.exports = reflux.createActions (eventsDeps);
>>>>>>> f8db2735dd3e78be1bac7d5b083f793e70d90da2
