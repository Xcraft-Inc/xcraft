'use strict';

module.exports = function (packagePath, sharePath, packageDef) {
  var path = require ('path');
  var xFs  = require ('xcraft-core-fs');

  var ver = packageDef.version;

  return {
    run: function (callback) {
      try {
        xFs.mv (path.join (sharePath, 'cache/data/zlib-' + ver + '/ChangeLog'),
                path.join (sharePath, 'cache/data/zlib-' + ver + '/ChangeLog.orig'));
      } catch (ex) {}
      callback ();
    }
  };
};
