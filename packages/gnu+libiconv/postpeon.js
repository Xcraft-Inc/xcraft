'use strict';

module.exports = function (packagePath, sharePath, packageDef) {
  var path = require ('path');
  var xFs  = require ('xcraft-core-fs');

  var ver = packageDef.version;

  return {
    run: function (callback) {
      try {
        xFs.mv (path.join (sharePath, 'cache/data/libiconv-' + ver + '/ChangeLog'),
                path.join (sharePath, 'cache/data/libiconv-' + ver + '/ChangeLog.orig'));

        xFs.mv (path.join (sharePath, 'cache/data/libiconv-' + ver + '/po/ChangeLog'),
                path.join (sharePath, 'cache/data/libiconv-' + ver + '/po/ChangeLog.orig'));

        xFs.mv (path.join (sharePath, 'cache/data/libiconv-' + ver + '/extras/ChangeLog'),
                path.join (sharePath, 'cache/data/libiconv-' + ver + '/extras/ChangeLog.orig'));

        xFs.mv (path.join (sharePath, 'cache/data/libiconv-' + ver + '/libcharset/ChangeLog'),
                path.join (sharePath, 'cache/data/libiconv-' + ver + '/libcharset/ChangeLog.orig'));

        xFs.mv (path.join (sharePath, 'cache/data/libiconv-' + ver + '/libcharset/lib/ChangeLog'),
                path.join (sharePath, 'cache/data/libiconv-' + ver + '/libcharset/lib/ChangeLog.orig'));
      } catch (ex) {}
      callback ();
    }
  };
};
