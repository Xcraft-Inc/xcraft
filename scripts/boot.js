'use strict';

var fs   = require ('fs');
var path = require ('path');

module.exports = function (paths) {
  var jsonFile = path.join (__dirname, '../etc/xcraft/config.json');
  var list = process.env.PATH.split (path.delimiter);

  /* With Windows, we must find cmd.exe or the exec() function fails.
   * It should not be necessary on Unix because it is always related to
   * /bin/sh which is absolute.
   * This section drops all unrelated path too.
   */
  if (process.env.COMSPEC !== undefined) {
    var systemDir = path.dirname (process.env.COMSPEC).replace (/\\/g, '\\\\');

    if (systemDir.length) {
      var regex = new RegExp ('^' + systemDir, 'i');

      list = list.filter (function (location) {
        return regex.test (location);
      });
    }
  }

  var xConfig = {};
  try {
    var data = fs.readFileSync (jsonFile, 'utf8');
    xConfig = JSON.parse (data);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }

  if (xConfig.hasOwnProperty ('path')) {
    xConfig.path.reverse ().forEach (function (location) {
      list.unshift (location);
    });
  }

  if (paths) {
    paths.reverse ().forEach (function (location) {
      list.unshift (location);
    });
  }

  process.env.PATH = list.join (path.delimiter);
};
