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
    modules[fileName] = require (path.join (modulePath, fileName));

    if (modules[fileName].hasOwnProperty ('eventDependencies')) {
      modules[fileName].eventDependencies.forEach (function (dep) {
        eventsDeps.push (dep.eventName);
      });
    }
  });
};

/* WebPack resolving method */
var loadStoreEventDependencies4Web = function () {
  var req = require.context ('../stores/', false, /store\.js$/);
  var storesRequire = req.keys ();
  for (var index = 0; index < storesRequire.length; ++index) {
    var storeId = req.resolve (storesRequire[index]);
    var store = __webpack_require__ (storeId);
    if (store.hasOwnProperty ('eventDependencies')) {
      for (var depIndex = 0; depIndex < store.eventDependencies.length; ++depIndex) {
        eventsDeps.push (store.eventDependencies[depIndex].eventName);
      }
    }
  }
};


if (typeof __WEBPACK__ !== 'undefined') {
  console.log ('Webpack context found! Loading events 4 web');
  loadStoreEventDependencies4Web ();
} else {
  loadStoreEventDependencies ();
}

module.exports = reflux.createActions (eventsDeps);
