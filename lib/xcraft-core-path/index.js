'use strict';

var fs   = require ('fs');
var path = require ('path');


exports.isIn = function (bin) {
  var exists = false;
  var fullLocation = null;
  var position = 0;

  var paths = process.env.PATH.split (path.delimiter);
  paths.some (function (location, index) {
    fullLocation = path.join (location, bin);
    position = index;
    exists = fs.existsSync (fullLocation);
    return exists;
  });

  return exists ? {
    index: position,
    location: fullLocation
  } : null;
};

/**
 * Strip an entry in the PATH.
 *
 * @param {number} index
 * @returns {string} The previous PATH.
 */
exports.strip = function (index) {
  var paths = process.env.PATH;
  var list = paths.split (path.delimiter);

  list.splice (index, 1);
  process.env.PATH = list.join (path.delimiter);

  return paths;
};
