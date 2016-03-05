'use strict';

const fs   = require ('fs');
const path = require ('path');
const xFs  = require ('xcraft-core-fs');


exports.run = function (filter, location, callbackAction) {
  var files = xFs.ls (location);

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
