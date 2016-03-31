'use strict';

var fs   = require ('fs');
var path = require ('path');

module.exports = function (paths) {
  var jsonFile = path.join (__dirname, '../../../etc/xcraft/config.json');
  var list = process.env.PATH.split (path.delimiter);

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

  list = list.filter (function (item) {
    return !!item.length;
  });

  process.env.PATH = list.join (path.delimiter);
};
