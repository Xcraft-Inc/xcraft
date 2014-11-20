'use strict';

var moduleName = 'xcraft';
var fs    = require ('fs');
var path  = require ('path');
var spawn = require ('child_process').spawn;

require ('./boot.js') ();

var cmd = {};


var argsToString = function (args) {
  var output = '';

  args.forEach (function (arg) {
    output = output + arg + ' ';
  });

  return output;
};

var startUNPMService = function () {
  console.log ('[' + moduleName + '] Info: starting uNPM Server');

  var backend = require ('unpm-fs-backend');
  var dataDir = path.resolve ('./usr/share/unpm');
  var data    = fs.readFileSync (path.resolve ('./etc/unpm/config.json'), 'utf8');
  var config  = JSON.parse (data);

  var tarballsDir = path.join (dataDir, 'tarballs');
  var userDir     = path.join (dataDir, 'users');
  var metaDir     = path.join (dataDir, 'meta');
  var storeDir    = path.join (dataDir, 'store');

  config.backend = backend (metaDir, userDir, tarballsDir, storeDir);

  var unpm = require ('unpm');
  var unpmService = unpm (config);
  unpmService.server.listen (unpmService.config.host.port);

  return unpmService;
};

var install = function (packages, useLocalRegistry, hostname, port, callback) {
  console.log ('[' + moduleName + '] Info: installing dependencies');

  try {
    var ext = /^win/.test (process.platform) ? '.cmd' : '';
    var npm = 'npm' + ext;
    var args = ['install'];


    if (useLocalRegistry) {
      args.push ('--registry');
      args.push ('http://' + hostname + ':' + port);
    }

    args = args.concat (packages);

    console.log ('[' + moduleName + '] Info: ' + npm + ' ' + argsToString (args));

    var installCmd = spawn (npm, args);

    installCmd.stdout.on ('data', function (data) {
      data.toString ().replace (/\r/g, '').split ('\n').forEach (function (line) {
        if (line.trim ().length) {
          console.log (line);
        }
      });
    });

    installCmd.stderr.on ('data', function (data) {
      data.toString ().replace (/\r/g, '').split ('\n').forEach (function (line) {
        if (line.trim ().length) {
          console.log (line);
        }
      });
    });

    installCmd.on ('close', function (code) { /* jshint ignore:line */
      if (callback) {
        callback ();
      }
    });
  } catch (err) {
    console.log ('[' + moduleName + '] Err: ' + err);
  }
};

var publish = function (packageToPublish, hostname, port, callback) {
  console.log ('[' + moduleName + '] Info: publishing ' + packageToPublish + ' in NPM');

  try {
    var ext = /^win/.test (process.platform) ? '.cmd' : '';
    var npm = 'npm' + ext;

    var args = ['--registry', 'http://' + hostname + ':' + port, 'publish'];

    var packagePath = path.resolve ('./lib/', packageToPublish);
    args.push (packagePath);

    console.log ('[' + moduleName + '] Info: ' + npm + ' ' + argsToString (args));

    var publishCmd = spawn (npm, args);

    publishCmd.stdout.on ('data', function (data) {
      data.toString ().replace (/\r/g, '').split ('\n').forEach (function (line) {
        if (line.trim ().length) {
          console.log (line);
        }
      });
    });

    publishCmd.stderr.on ('data', function (data) {
      data.toString ().replace (/\r/g, '').split ('\n').forEach (function (line) {
        if (line.trim ().length) {
          console.log (line);
        }
      });
    });

    publishCmd.on ('close', function (code) { /* jshint ignore:line */
      if (callback) {
        callback ();
      }
    });
  } catch (err) {
    console.log ('[' + moduleName + '] Err: ' + err);
  }
};

var createConfig = function (paths) {
  var root       = path.resolve ('./');

  var config = {
    xcraftRoot       : root,
    nodeModulesRoot  : path.join (root, './node_modules/'),
    tempRoot         : path.join (root, './var/tmp/'),
    pkgTempRoot      : path.join (root, './var/tmp/wpkg/'),
    pkgDebRoot       : path.join (root, './var/wpkg/'),
    pkgBaseRoot      : path.join (root, './packages/base/'),
    pkgProductsRoot  : path.join (root, './packages/products/'),
    pkgTargetRoot    : path.join (root, './var/devroot/'),
    nodeModules      : path.join (root, './node_modules/'),
    path             : []
  };

  paths.forEach (function (p) {
    config.path.push (path.resolve (p));
  });

  return config;
};

/**
 * Create main config file in etc.
 * @param {Object} paths ([path1,path2...])
 */
cmd.init = function (paths, callback) {
  console.log ('[' + moduleName + '] Info: creating main configuration file');

  var dir      = path.resolve ('./etc/xcraft/');
  var fileName = path.join (dir, 'config.json');

  if (!fs.existsSync (dir)) {
    fs.mkdirSync (dir);
  }

  fs.writeFileSync (fileName, JSON.stringify (createConfig (paths), null, '  '));

  callback ();
};

/**
 * Npm install third packages.
 * @param {Object} deps - ([dep1, dep2...])
 */
cmd.prepare = function (deps, callback) {
  install (deps, false, '', '', callback);
};

/**
 * Configure uNPM with backend.
 * @param {Object} configUnpm - ([IP address, port])
 */
cmd.deploy = function (configUnpm, callback) {
  console.log ('[' + moduleName + '] Info: changing uNPM Server configuration');

  var unpmNetworkConf = configUnpm.split (':');
  var configFile = path.resolve ('./etc/unpm/config.json');
  var config     = JSON.parse (fs.readFileSync (configFile, 'utf8'));

  config.host.hostname = unpmNetworkConf[0];
  config.host.port     = parseInt (unpmNetworkConf[1]);

  fs.writeFileSync (configFile, JSON.stringify (config, null, '  '));

  callback ();
};

/**
 * Create xcraft-* config in etc.
 * If module is all, create config for all installed modules.
 * @param {Object} modules ([mod1,mod2...])
 */
cmd.defaults = function (modules, callback) {
  var xEtc = require ('xcraft-core-etc');

  if (!modules.length) {
    console.log ('[' + moduleName + '] Info: configuring all modules');
    xEtc.createAll (path.resolve ('./node_modules/'), /^xcraft-(core|contrib)/);
  } else {
    modules.forEach (function (mod) {
      console.log ('[' + moduleName + '] Info: configuring xcraft-' + mod);
      xEtc.createAll (path.resolve ('./node_modules/'), '/^xcraft-' + mod + '/');
    });
  }

  callback ();
};

/**
 * Configure a module.
 */
cmd.configure = function (modules, callback) {
  var xEtc = require ('xcraft-core-etc');

  xEtc.configureAll (path.resolve ('./node_modules'), /^xcraft-(core|contrib)/, callback);
};

/**
 * Npm publish xcraft-core in local registry.
 * TODO: handle modules argument
 */
cmd.publish = function (modules, callback) {
  var async = require ('async');

  var unpmService = startUNPMService ();
  var packages = fs.readdirSync (path.resolve ('./lib/'));

  async.eachSeries (packages, function (packageToPublish, callback) {
    publish (packageToPublish, unpmService.config.host.hostname, unpmService.config.host.port, callback);
  },
  function (err) {
    unpmService.server.close ();
    callback ();
  });
};

/**
 * Install xcraft-zog from local registry.
 * TODO: handle modules argument
 */
cmd.install = function (modules, callback) {
  var packages    = fs.readdirSync (path.resolve ('./lib/'));
  var unpmService = startUNPMService ();

  install (packages, true, unpmService.config.host.hostname, unpmService.config.host.port, function () {
    unpmService.server.close ();
    callback ();
  });
};

/**
 * Check outdated packages.
 * TODO: handle modules argument
 */
cmd.verify = function (modules, callback) {
  console.log ('[' + moduleName + '] Info: starting modules verification');

  var packages = fs.readdirSync ('./lib/');

  packages.forEach (function (p) {
    var libVersionStr = JSON.parse (fs.readFileSync (path.resolve ('./lib/', p, 'package.json'), 'utf8')).version;
    var installedVersionStr = JSON.parse (fs.readFileSync (path.resolve ('./node_modules/', p, 'package.json'), 'utf8')).version;
    var libVersion = libVersionStr.split ('.');
    var installedVersion = installedVersionStr.split ('.');

    if (parseInt (libVersion[0]) > parseInt (installedVersion[0]) ||
        parseInt (libVersion[1]) > parseInt (installedVersion[1]) ||
        parseInt (libVersion[2]) > parseInt (installedVersion[2])) {
      console.log ('[' + moduleName + '] Warn: installed version of ' + p + ' is outdated (' + libVersionStr + ' > ' + installedVersionStr + ')');
    }
  });

  callback ();
};

/**
 * Retrieve the list of available commands.
 * @returns {Object[]} The list of commands.
 */
exports.register = function (callback) {
  var rcFile = path.join (__dirname, './rc.json');
  var rc     = JSON.parse (fs.readFileSync (rcFile, 'utf8'));
  var list   = [];

  Object.keys (cmd).forEach (function (action) {
    var options = rc[action] && rc[action].options ? rc[action].options : {};

    list.push ({
      name    : action,
      desc    : rc[action] ? rc[action].desc : null,
      options : options,
      handler : function (callback, args) {
        cmd[action] (args, callback);
      }
    });
  });

  callback (list);
};

exports.unregister = function () {};
