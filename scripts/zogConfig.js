
var path = require ('path');

process.chdir (path.join (__dirname, '/..'));

/* Const helpers. */
exports.pkgCfgFileName  = 'config.yaml';
exports.chestServerName = '127.0.0.1';
exports.chestServerPort = 8080;
exports.chestServerPid  = './var/pid/chestd.pid'
exports.chestServerRepo = path.resolve ('./chest/');

/* Path helpers. */
exports.toolchainRoot   = path.resolve ('./');
exports.libRoot         = path.resolve ('./scripts/lib/');
exports.loktharRoot     = path.resolve ('./lokthar/');
exports.nodeModulesRoot = path.resolve ('./node_modules/');
exports.pkgTempRoot     = path.resolve ('./tmp/');
exports.pkgBaseRoot     = path.resolve ('./packages/base/');
exports.pkgProductsRoot = path.resolve ('./packages/products/');
exports.chestServer     = path.resolve ('./scripts/chest/chestServer.js');

/* Lib helpers. */
exports.libPkgCreate    = path.resolve ('./scripts/manager/pkgCreate.js');
exports.libPkgList      = path.resolve ('./scripts/manager/pkgList.js');
exports.libPkgWizard    = path.resolve ('./scripts/manager/pkgWizard.js');
exports.libPkgControl   = path.resolve ('./scripts/manager/pkgControl.js');
exports.libPkgMake      = path.resolve ('./scripts/manager/pkgMake.js');

/* Bin helpers. */
exports.binGrunt        = path.join (exports.nodeModulesRoot, 'grunt-cli/bin/grunt');
