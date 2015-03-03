'use strict';

var fs   = require ('fs');
var path = require ('path');

var envPath  = process.env.PATH || process.env.path || process.env.Path;
var pathList = envPath.split (path.delimiter);


var main = function () {
  /* With Windows, we must find cmd.exe or the exec() function fails.
   * It should not be necessary on Unix because it is always related to
   * /bin/sh which is absolute.
   * This section drops all unrelated path too.
   */
  if (process.env.COMSPEC !== undefined) {
    var systemDir = path.dirname (process.env.COMSPEC).replace (/\\/g, '\\\\');

    if (systemDir.length) {
      var regex = new RegExp ('^' + systemDir, 'i');

      pathList = pathList.filter (function (location) {
        return regex.test (location);
      });
    }
  }

  Array.observe (pathList, function () {
    process.env.PATH = pathList.join (path.delimiter);
  });
};

/**
 * Unshift a new location in the PATH.
 *
 * The new location will be at the top.
 *
 * @param {string} location
 */
exports.unshift = function (location) {
  location = path.resolve (location);
  if (pathList.indexOf (location) !== -1) {
    return;
  }

  pathList.unshift (location);
};

/**
 * Push a new location in the PATH.
 *
 * The new location will be at the bottom.
 *
 * @param {string} location
 */
exports.push = function (location) {
  location = path.resolve (location);
  if (pathList.indexOf (location) !== -1) {
    return;
  }

  pathList.push (location);
};

/**
 * Look for a file in the PATH.
 *
 * In most of cases it should be an executable, but this function looks only
 * if the file exists. The full name must be used. For example on Windows, the
 * extension (like .exe) is mandatory.
 *
 * @param {string} bin
 * @returns {Object} The index and the location.
 */
exports.isIn = function (bin) {
  var exists = false;
  var fullLocation = null;
  var position = 0;

  pathList.some (function (location, index) {
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
  var paths = pathList.slice ();

  pathList.splice (index, 1);
  return paths;
};

/**
 * Get all locations available in PATH.
 *
 * @returns {string[]} The current PATH.
 */
exports.getList = function () {
  return pathList.slice ();
};

/**
 * Set all PATH locations.
 *
 * @param {string[]} list
 */
exports.setList = function (list) {
  pathList.length = 0;
  list.forEach (function (v) {
    pathList.push (v);
  });
};

main ();
