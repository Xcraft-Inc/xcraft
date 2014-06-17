
var path = require ('path');

process.chdir (path.join (__dirname, '/..'));

exports.toolchainRoot   = path.resolve ('./');
exports.libRoot         = path.resolve ('./scripts/lib/');
exports.pkgTempRoot     = path.resolve ('./tmp/');
exports.pkgBaseRoot     = path.resolve ('./packages/base/');
exports.pkgProductsRoot = path.resolve ('./packages/products/');
exports.pkgCreate       = path.resolve ('./scripts/manager/pkgCreate.js');
exports.pkgList         = path.resolve ('./scripts/manager/pkgList.js');
exports.pkgWizard       = path.resolve ('./scripts/manager/pkgWizard.js');
exports.loktharRoot     = path.resolve ('./lokthar/');
exports.nodeModulesRoot = path.resolve ('./node_modules/');
