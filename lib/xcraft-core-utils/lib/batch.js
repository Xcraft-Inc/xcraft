'use strict';

var fs   = require ('fs');
var path = require ('path');


exports.run = function (filter, location, callbackAction) {
  var files = exports.ls (location);

  files.forEach (function (file) {
    var fullPath = path.join (location, file);
    var st = fs.statSync (fullPath);

    if (st.isDirectory ()) {
      exports.run (filter, fullPath, callbackAction);
      return;
    }

    if (!filter || filter.test (file)) {
      callbackAction (fullPath);
      return;
    }
  });
};
