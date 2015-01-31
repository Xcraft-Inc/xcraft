'use strict';

var moduleName = 'xcraft';
var fs    = require ('fs');
var path  = require ('path');
var spawn = require ('child_process').spawn;

require ('./boot.js') ();

var cmd = {};
var opt = {};

var modprefix = '';


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
  var dataDir = path.resolve ('./var/unpm');
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

var spawnNpm = function (args, callback, callbackStdout) {
  var ext = /^win/.test (process.platform) ? '.cmd' : '';
  var npm = 'npm' + ext;

  console.log ('[' + moduleName + '] Info: ' + npm + ' ' + argsToString (args));

  var cmd = spawn (npm, args);

  cmd.stdout.on ('data', function (data) {
    data.toString ().replace (/\r/g, '').split ('\n').forEach (function (line) {
      if (line.trim ().length) {
        if (callbackStdout) {
          callbackStdout (line);
        } else {
          console.log (line);
        }
      }
    });
  });

  cmd.stderr.on ('data', function (data) {
    data.toString ().replace (/\r/g, '').split ('\n').forEach (function (line) {
      if (line.trim ().length) {
        console.log (line);
      }
    });
  });

  cmd.on ('close', function (code) { /* jshint ignore:line */
    if (callback) {
      callback ();
    }
  });
};

var install = function (packages, useLocalRegistry, hostname, port, callback) {
  console.log ('[' + moduleName + '] Info: installing dependencies');

  try {
    var args = ['install'];

    if (modprefix.length) {
      args.push ('--prefix');
      args.push (modprefix);
    }

    if (useLocalRegistry) {
      args.push ('--registry');
      args.push ('http://' + hostname + ':' + port);
    }

    args = args.concat (packages);
    spawnNpm (args, callback);
  } catch (err) {
    console.log ('[' + moduleName + '] Err: ' + err);
  }
};

var publish = function (packageToPublish, isDir, hostname, port, callback) {
  console.log ('[' + moduleName + '] Info: publishing ' + packageToPublish + ' in NPM');

  try {
    var args = [
      '--ignore-scripts',
      '--registry',
      'http://' + hostname + ':' + port,
      'publish'
    ];

    var packagePath = isDir ? path.resolve ('./lib/', packageToPublish) : packageToPublish;

    if (path.extname (packagePath) !== '.tgz' &&
        !fs.existsSync (path.join (packagePath, 'package.json'))) {
      console.log ('[' + moduleName + '] Info: ' + packagePath + ' is not a valid npm package, skipping');
      callback ();
      return;
    }
    args.push (packagePath);
    spawnNpm (args, callback);
  } catch (err) {
    console.log ('[' + moduleName + '] Err: ' + err);
  }
};

var unpublish = function (packageToUnPublish, isDir, hostname, port, callback) {
  console.log ('[' + moduleName + '] Info: un-publishing ' + packageToUnPublish + ' in uNPM');

  try {
    var args = [
      '--ignore-scripts',
      '--registry',
      'http://' + hostname + ':' + port,
      'unpublish',
      packageToUnPublish
    ];

    spawnNpm (args, callback);
  } catch (err) {
    console.log ('[' + moduleName + '] Err: ' + err);
  }
};

var resolveTarball = function (packageWithVersion, callback) {
  var args = [
    'view',
    packageWithVersion,
    'dist',
    '--json'
  ];

  var json = '';

  spawnNpm (args, function () {
    var dist = JSON.parse (json);
    callback (null, dist);
  }, function (line) {
    json += line;
  });
};

var cache = function (from, hostname, port, callback) {
  var async = require ('async');

  console.log ('[' + moduleName + '] Info: cache third packages in uNPM');

  var args = ['ls', '--json'];
  var json = '';

  spawnNpm (args, function () {
    var list = [];
    var deps = JSON.parse (json);

    var traverse = function (obj, func) {
      Object.keys (obj).forEach (function (item) {
        if (obj[item] !== null && typeof obj[item] === 'object') {
          func (item, obj[item]);
          traverse (obj[item], func);
        }
      });
    };

    traverse (deps, function (key, value) {
      if (!value.hasOwnProperty ('version') || /^xcraft-/.test (key)) {
        return;
      }

      var id = key + '@' + value.version;
      if (list.indexOf (id) === -1) {
        list.push (id);
      }
    });

    async.eachLimit (list, 4, function (id, callback) {
      resolveTarball (id, function (err, dist) {
        if (!err) {
          publish (dist.tarball, false, hostname, port, callback);
        } else {
          callback (err);
        }
      });
    }, callback);
  }, function (line) {
    json += line;
  });
};

var viewVersions = function (packageToView, hostname, port, callback) {
  var args = [
    '--registry',
    'http://' + hostname + ':' + port,
    'view',
    packageToView,
    'versions',
    '--json'
  ];

  var json = '';

  spawnNpm (args, function () {
    if (!json.length) {
      callback ('no version');
      return;
    }

    var versions = JSON.parse (json);

    if (!Array.isArray (versions)) {
      versions = [versions];
    }

    callback (null, versions);
  }, function (line) {
    json += line;
  });
};

var createConfig = function (paths) {
  var root       = path.resolve ('./');

  var config = {
    xcraftRoot       : root,
    nodeModulesRoot  : path.join (root, './node_modules/'),
    tempRoot         : path.join (root, './var/tmp/'),
    pkgTempRoot      : path.join (root, './var/tmp/wpkg/'),
    pkgDebRoot       : path.join (root, './var/wpkg/'),
    pkgProductsRoot  : path.join (root, './packages/'),
    pkgTargetRoot    : path.join (root, './var/devroot/'),
    path             : []
  };

  paths.forEach (function (p) {
    config.path.push (path.resolve (p));
  });

  return config;
};

/**
* Start uNPM instance
*
*/
cmd.unpm = function () {
  startUNPMService ();
};

/**
 * Create main config file in etc.
 *
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
 * Configure uNPM with backend.
 *
 * @param {Object} configUnpm - ([IP address, port])
 */
cmd.deploy = function (configUnpm, callback) {
  console.log ('[' + moduleName + '] Info: changing uNPM Server configuration');

  var unpmNetworkConf = configUnpm[0].split (':');
  var configFile = path.resolve ('./etc/unpm/config.json');
  var config     = JSON.parse (fs.readFileSync (configFile, 'utf8'));

  config.host.hostname = unpmNetworkConf[0];
  config.host.port     = parseInt (unpmNetworkConf[1]);

  fs.writeFileSync (configFile, JSON.stringify (config, null, '  ') + '\n');

  callback ();
};

/**
 * Create xcraft-* config in etc.
 * If module is all, create config for all installed modules.
 *
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
 */
cmd.publish = function (modules, callback) {
  var async = require ('async');

  var packages    = modules.length ? modules : fs.readdirSync (path.resolve ('./lib/'));
  var unpmService = startUNPMService ();

  async.eachLimit (packages, 4, function (packageToPublish, callback) {
    publish (packageToPublish, true, unpmService.config.host.hostname, unpmService.config.host.port, callback);
  },
  function () {
    unpmService.server.close ();
    callback ();
  });
};

/**
* Npm un-publish xcraft-core in local registry.
*/
cmd.unpublish = function (modules, callback) {
  var async = require ('async');

  var unpmService = startUNPMService ();
  var server = unpmService.config.host.hostname;
  var port   = unpmService.config.host.port;

  var runUnpublish = function (list, callback) {
    async.eachLimit (list, 4, function (packageToUnPublish, callback) {
      unpublish (packageToUnPublish, true, server, port, callback);
    },
    function () {
      unpmService.server.close ();
      callback ();
    });
  };

  if (modules.length) {
    runUnpublish (modules, callback);
    return;
  }

  var list = [];
  var packages = fs.readdirSync (path.resolve ('./lib/'));

  async.eachLimit (packages, 4, function (packageToView, callback) {
    viewVersions (packageToView, server, port, function (err, versions) {
      if (err) {
        /* ignore this package */
        callback ();
        return;
      }

      versions.forEach (function (version) {
        list.push (packageToView + '@' + version);
      });
      callback ();
    });
  }, function () {
    runUnpublish (list, callback);
  });
};

/**
 * Clone third packages in our uNPM registry.
 */
cmd.cache = function (args, callback) {
  var unpmService = startUNPMService ();

  cache (unpmService.config.fallback, unpmService.config.host.hostname, unpmService.config.host.port, function () {
    unpmService.server.close ();
    callback ();
  });
};

/**
 * Install xcraft-zog from local registry.
 */
cmd.install = function (modules, callback) {
  var packages    = modules.length ? modules : fs.readdirSync (path.resolve ('./lib/'));
  packages = packages.filter (function (pkg) {
    var packagePath = path.resolve ('./lib/', pkg);
    return fs.existsSync (path.join (packagePath, 'package.json'));
  });

  var unpmService = startUNPMService ();

  install (packages, true, unpmService.config.host.hostname, unpmService.config.host.port, function () {
    unpmService.server.close ();
    callback ();
  });
};

/**
 * Check outdated packages.
 */
cmd.verify = function (modules, callback) {
  console.log ('[' + moduleName + '] Info: starting modules verification');

  var packages = modules.length ? modules : fs.readdirSync (path.resolve ('./lib/'));

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

opt.modprefix = function (args, callback) {
  modprefix = args[0];
  callback ();
};

/**
 * Retrieve the list of available commands.
 */
exports.register = function (extension, callback) {
  var rcFile = path.join (__dirname, './rc.json');
  var rc     = JSON.parse (fs.readFileSync (rcFile, 'utf8'));

  Object.keys (cmd).forEach (function (action) {
    var resource = rc[action] && rc[action].options ? rc[action].options : {};

    extension
      .command (action,
                rc[action] ? rc[action].desc : null,
                resource,
                function (callback, args) {
                  cmd[action] (args, callback);
                });
  });

  Object.keys (opt).forEach (function (option) {
    var resource = rc[option] && rc[option].options ? rc[option].options : {};

    extension
      .option ('-' + option[0] + ', --' + option,
               rc[option] ? rc[option].desc : null,
               resource,
               function (callback, args) {
                 opt[option] (args, callback);
               });
  });

  callback ();
};

exports.unregister = function (callback) {
  callback ();
};
