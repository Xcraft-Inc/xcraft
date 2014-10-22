'use strict';

var fs   = require ('fs');
var path = require ('path');

module.exports = function () {
  var jsonFile = path.join (__dirname, '../etc/xcraft/config.json');
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

  process.env.PATH = list.join (path.delimiter);
};
