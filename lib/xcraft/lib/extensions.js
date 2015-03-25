'use strict';

var moduleName = 'xcraft';

var fs    = require ('fs');
var path  = require ('path');

require ('./boot.js') ();

var unpm    = require ('./unpm/unpm.js');
var watcher = require ('./watcher/watcher.js');

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

var spawnNpm = function (args, callback, callbackStdout) {
  var spawn = require ('./spawn.js');

  console.log ('[' + moduleName + '] Info: npm ' + argsToString (args));

  spawn.run ('npm', args, callback, callbackStdout);
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
      if (!value.hasOwnProperty ('version') || /(^xcraft|xcraft$)/.test (key)) {
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
    xcraftRoot:      root,
    nodeModulesRoot: path.join (root, './node_modules/'),
    tempRoot:        path.join (root, './var/tmp/'),
    pkgTempRoot:     path.join (root, './var/tmp/wpkg/'),
    pkgDebRoot:      path.join (root, './var/wpkg/'),
    pkgProductsRoot: path.join (root, './packages/'),
    pkgTargetRoot:   path.join (root, './var/devroot/'),
    path:            []
  };

  paths.forEach (function (p) {
    config.path.push (path.resolve (p));
  });

  return config;
};

var packagesFilter = function (modules) {
  var packages = fs.readdirSync (path.resolve ('./lib/'));
  packages = packages.filter (function (pkg) {
    var packagePath = path.resolve ('./lib/', pkg);
    return fs.existsSync (path.join (packagePath, 'package.json'));
  });

  if (!modules.length) {
    return packages;
  }

  var list = [];

  /* Fuzzy finder */
  modules.forEach (function (pkg) {
    if (packages.indexOf (pkg) !== -1) {
      list.push (pkg);
      return;
    }

    packages.forEach (function (item) {
      if (new RegExp ('.*' + pkg + '.*').test (item)) {
        list.push (item);
        console.log ('[' + moduleName + '] Info: the provided package \'' +
                     pkg + '\' has been replaced by \'' + item + '\'');
      }
    });
  });

  return list;
};

/**
 * Start uNPM instance
 *
 */
cmd.unpm = function (cmd, callback) {
  if (unpm.hasOwnProperty (cmd[0])) {
    unpm[cmd[0]] ();
  }

  callback ();
};

/**
 * Start lib watcher.
 */
cmd.watcher = function (cmd, callback) {
  if (watcher.hasOwnProperty (cmd[0])) {
    watcher[cmd[0]] ();
  }

  callback ();
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
 * UnpubPubInstall WORKAROUND
 */
cmd.upi = function (modules, callback) {
  var install = function () {
    cmd.install (modules, callback);
  };

  var publish = function () {
    cmd.publish (modules, install);
  };

  cmd.unpublish (modules, publish);
};

/**
 * Npm publish xcraft-core in local registry.
 */
cmd.publish = function (modules, callback) {
  var async = require ('async');

  var packages = packagesFilter (modules);

  unpm.start ();

  async.eachLimit (packages, 4, function (packageToPublish, callback) {
    publish (packageToPublish, true, unpm.conf.hostname, unpm.conf.port, callback);
  },
  function () {
    unpm.stop ();
    callback ();
  });
};

/**
* Npm un-publish xcraft-core in local registry.
*/
cmd.unpublish = function (modules, callback) {
  var async = require ('async');

  unpm.start ();
  var server = unpm.conf.hostname;
  var port   = unpm.conf.port;

  var runUnpublish = function (list, callback) {
    async.eachLimit (list, 4, function (packageToUnPublish, callback) {
      unpublish (packageToUnPublish, true, server, port, callback);
    },
    function () {
      unpm.stop ();
      callback ();
    });
  };

  var list = [];
  var packages = packagesFilter (modules);

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
  unpm.start ();

  cache (unpm.conf.fallback, unpm.conf.hostname, unpm.conf.port, function () {
    unpm.stop ();
    callback ();
  });
};

/**
 * Install xcraft-zog from local registry.
 */
cmd.install = function (modules, callback) {
  var packages = packagesFilter (modules);

  unpm.start ();

  install (packages, true, unpm.conf.hostname, unpm.conf.port, function () {
    unpm.stop ();
    callback ();
  });
};

/**
 * Check outdated packages.
 */
cmd.verify = function (modules, callback) {
  console.log ('[' + moduleName + '] Info: starting modules verification');

  var packages = packagesFilter (modules);

  packages.forEach (function (p) {
    var libFile       = fs.readFileSync (path.resolve ('./lib/', p, 'package.json'), 'utf8');
    var installedFile = fs.readFileSync (path.resolve ('./node_modules/', p, 'package.json'), 'utf8');

    var libVersionStr = JSON.parse (libFile).version;
    var installedVersionStr = JSON.parse (installedFile).version;
    var libVersion = libVersionStr.split ('.');
    var installedVersion = installedVersionStr.split ('.');

    if (parseInt (libVersion[0]) > parseInt (installedVersion[0]) ||
        parseInt (libVersion[1]) > parseInt (installedVersion[1]) ||
        parseInt (libVersion[2]) > parseInt (installedVersion[2])) {
      console.log ('[' + moduleName + '] Warn: installed version of ' + p + ' is outdated (' +
                   libVersionStr + ' > ' + installedVersionStr + ')');
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
