'use strict';

module.exports = function (packagePath, sharePath) {
  var path = require ('path');
  var xFs  = require ('xcraft-core-fs');

  return {
    copy: function (callback) {
      try {
        xFs.mv (path.join (sharePath, 'cache/data/zlib-1.2.8/ChangeLog'),
                path.join (sharePath, 'cache/data/zlib-1.2.8/ChangeLog.orig'));
      } catch (ex) {}
      callback ();
    }
  };
};
