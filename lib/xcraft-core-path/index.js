'use strict';

var fs   = require ('fs');
var path = require ('path');

var xPlatform = require ('xcraft-core-platform');
var xConfig   = require ('xcraft-core-etc').load ('xcraft');

var envPath  = process.env.PATH || process.env.path || process.env.Path;
var pathList = {
  xcraft:  envPath.split (path.delimiter),
  devroot: []
};


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

      pathList.xcraft = pathList.xcraft.filter (function (location) {
        return regex.test (location);
      });
    }
  }

  if (xConfig.hasOwnProperty ('path')) {
    xConfig.path.reverse ().forEach (function (location) {
      pathList.xcraft.unshift (location);
    });
  }

  pathList.xcraft.unshift (path.resolve ('./usr/bin'));
  pathList.xcraft.unshift (path.resolve ('.'));
  pathList.xcraft.unshift (path.resolve ('./node_modules/.bin'));

  var updatePath = function () {
    process.env.PATH = pathList.devroot.concat (pathList.xcraft).join (path.delimiter);
  };

  updatePath ();

  Array.observe (pathList.xcraft,  updatePath);
  Array.observe (pathList.devroot, updatePath);
};

exports.devrootUpdate = function () {
  var xFs = require ('xcraft-core-fs');

  var arch = xPlatform.getToolchainArch ();

  pathList.devroot.length = 0;
  pathList.devroot.unshift (path.join (xConfig.pkgTargetRoot, arch, 'usr/bin'));
  pathList.devroot.unshift (path.join (xConfig.pkgTargetRoot, arch, 'bin'));

  var length = pathList.devroot.length;

  var dir = path.join (xConfig.pkgTargetRoot, arch, 'etc/path');
  try {
    xFs.ls (dir).forEach (function (item) {
      var location = JSON.parse (fs.readFileSync (path.join (dir, item), 'utf8'));
      location.forEach (function (entry) {
        pathList.devroot.unshift (path.join (xConfig.pkgTargetRoot, arch, entry));
      });
    });
  } catch (ex) {
    pathList.devroot.length = length;
  }
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
  if (pathList.xcraft.indexOf (location) !== -1) {
    return;
  }

  pathList.xcraft.unshift (location);
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
  if (pathList.xcraft.indexOf (location) !== -1) {
    return;
  }

  pathList.xcraft.push (location);
};

/**
 * Look for a file in the Xcraft PATH.
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

  pathList.xcraft.some (function (location, index) {
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
 * Strip an entry in the Xcraft PATH.
 *
 * @param {number} index
 * @returns {string} The stripped location.
 */
exports.strip = function (index) {
  return pathList.xcraft.splice (index, 1)[0];
};

/**
 * Insert a location in the Xcraft PATH.
 *
 * @param {number} index
 * @param {string} location
 */
exports.insert = function (index, location) {
  pathList.xcraft.splice (index, 0, location);
};

/**
 * Get all locations available in PATH.
 *
 * @returns {string[]} The current PATH.
 */
exports.getList = function () {
  return pathList.devroot.concat (pathList.xcraft).slice ();
};

main ();
