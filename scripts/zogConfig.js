
var path = require ('path');

process.chdir (path.join (__dirname, '/..'));

exports.pkgCfgFileName  = 'config.yaml';

exports.toolchainRoot   = path.resolve ('./');
exports.libRoot         = path.resolve ('./scripts/lib/');
exports.loktharRoot     = path.resolve ('./lokthar/');
exports.nodeModulesRoot = path.resolve ('./node_modules/');
exports.pkgTempRoot     = path.resolve ('./tmp/');
exports.pkgBaseRoot     = path.resolve ('./packages/base/');
exports.pkgProductsRoot = path.resolve ('./packages/products/');

exports.libPkgCreate    = path.resolve ('./scripts/manager/pkgCreate.js');
exports.libPkgList      = path.resolve ('./scripts/manager/pkgList.js');
exports.libPkgWizard    = path.resolve ('./scripts/manager/pkgWizard.js');
exports.libPkgControl   = path.resolve ('./scripts/manager/pkgControl.js');
