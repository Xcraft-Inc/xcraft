'use strict';

var moduleName = 'xcraft';

var fs = require('fs');
var path = require('path');

require('./boot.js')();

var cmd = {};
var opt = {};

var modprefix = '';

const dirArray = __dirname.split(path.sep);
const pos = dirArray.indexOf('sysroot') + 1; /* FIXME: remove this hack */
process.env.XCRAFT_ROOT = path.resolve(
  __dirname,
  dirArray.slice(0, pos + 1).join(path.sep)
);

var createConfig = function (paths) {
  const isWin = process.platform === 'win32';
  const root = path.resolve('./');
  const tempRoot = path.join(root, './var/tmp/');
  const driveRoot = isWin ? path.join(path.parse(root).root, 'xcraft') : root;

  var config = {
    xcraftRoot: root,
    xcraftDriveRoot: driveRoot,
    tempRoot,
    tempDriveRoot: isWin ? path.join(driveRoot, 'tmp') : tempRoot,
    pkgTempRoot: path.join(tempRoot, './wpkg/'),
    pkgDebRoot: path.join(root, './var/wpkg/'),
    pkgProductsRoot: path.join(root, './packages/'),
    pkgTargetRoot: path.join(root, './var/devroot/'),
    path: [],
  };

  paths.forEach(function (p) {
    config.path.push(path.resolve(p));
  });

  return config;
};

/**
 * Create main config file in etc.
 *
 * @param {Object} paths - ([path1,path2...])
 */
cmd.init = function (paths, callback) {
  console.log('[' + moduleName + '] Info: creating main configuration file');

  var dir = path.resolve('./etc/xcraft/');
  var fileName = path.join(dir, 'config.json');

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  fs.writeFileSync(fileName, JSON.stringify(createConfig(paths), null, '  '));

  callback();
};

/**
 * Populate the bin/ directory with the base commands for bootstrapping.
 */
cmd.bin = (list, callback) => {
  console.log(`[${moduleName}] Info: populating the bin/ directory`);

  const binDir = path.resolve('./bin');

  try {
    fs.mkdirSync(binDir);
  } catch (ex) {
    if (ex.code !== 'EEXIST') {
      throw ex;
    }
  }

  if (!list.length) {
    const binList = JSON.parse(
      fs.readFileSync(path.join(__dirname, './bins.json'))
    );
    list = Object.keys(binList).filter((bin) => {
      return new RegExp(binList[bin]).test(process.platform);
    });
  }

  const which = require('which');

  try {
    list.forEach((bin) => {
      let location;
      try {
        /* Skip unusual locations like /usr/local/opt */
        const locations = which
          .sync(bin, {all: true})
          .filter(
            (location) =>
              !location.startsWith(binDir) &&
              !location.startsWith('/usr/local/opt') &&
              !location.includes('/ccache/')
          );
        if (locations.length >= 1) {
          location = locations[0];
        } else {
          throw new Error(`${bin} not found`);
        }
      } catch (ex) {
        console.log(`[${moduleName}] Warn: ${ex.message}`);
        return;
      }

      try {
        try {
          fs.symlinkSync(location, path.join(binDir, bin));
          if (process.platform === 'win32') {
            fs.renameSync(
              path.join(binDir, bin),
              path.join(binDir, bin + '.exe')
            );
          }
        } catch (ex) {
          if (process.platform === 'win32' && ex.code === 'EPERM') {
            const script = `@echo off&"${location}" %*`;
            const input = path.join(binDir, `${bin}.exe`);
            const output = path.join(__dirname, './go/goc/goc.exe');

            fs.writeFileSync(path.join(binDir, `${bin}.cmd`), script);
            fs.createReadStream(output).pipe(fs.createWriteStream(input));
          } else {
            throw ex;
          }
        }
      } catch (ex) {
        if (ex.code !== 'EEXIST') {
          throw ex;
        }
      }
    });
    callback();
  } catch (ex) {
    console.log(`[${moduleName}] Warn: ${ex.message}`);
    callback(ex);
  }
};

/**
 * Create xcraft-* config in etc.
 * If module is all, create config for all installed modules.
 *
 * @param {Object} modules - ([mod1,mod2...])
 */
cmd.defaults = function (modules, callback) {
  var xEtc = require('xcraft-core-etc')();

  const override = path.resolve('./etc.js');

  if (!modules.length) {
    console.log('[' + moduleName + '] Info: configuring all modules');
    xEtc.createAll(
      path.resolve('./node_modules/'),
      /^(goblin-|(xcraft-(core|contrib)))/,
      override
    );
  } else {
    modules.forEach(function (mod) {
      console.log('[' + moduleName + '] Info: configuring xcraft-' + mod);
      xEtc.createAll(
        path.resolve('./node_modules/'),
        '/^xcraft-' + mod + '/',
        override
      );
    });
  }

  callback();
};

/**
 * Configure a module.
 */
cmd.configure = function (modules, callback) {
  var xEtc = require('xcraft-core-etc')();

  const filters = modules.length
    ? new RegExp(`^(${modules.join('|')})$`)
    : /^goblin-|(xcraft-(core|contrib))/;

  xEtc.configureAll(path.resolve('./node_modules'), filters, callback);
};

opt.modprefix = function (args, callback) {
  modprefix = args[0];
  callback();
};

/**
 * Retrieve the list of available commands.
 */
exports.register = function (extension, callback) {
  var rcFile = path.join(__dirname, './rc.json');
  var rc = JSON.parse(fs.readFileSync(rcFile, 'utf8'));

  Object.keys(cmd).forEach(function (action) {
    var resource = rc[action] && rc[action].options ? rc[action].options : {};

    extension.command(
      action,
      rc[action] ? rc[action].desc : null,
      resource,
      function (callback, args) {
        cmd[action](args, callback);
      }
    );
  });

  Object.keys(opt).forEach(function (option) {
    var resource = rc[option] && rc[option].options ? rc[option].options : {};

    extension.option(
      '-' + option[0] + ', --' + option,
      rc[option] ? rc[option].desc : null,
      resource,
      function (callback, args) {
        opt[option](args, callback);
      }
    );
  });

  callback();
};

exports.unregister = function (callback) {
  callback();
};
