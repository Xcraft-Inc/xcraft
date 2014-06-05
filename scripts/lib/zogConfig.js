
var path = require ('path');

process.chdir (path.join (__dirname, '/../..'));

exports.pkgBaseRoot     = path.resolve ('./packages/base/');
exports.pkgProductsRoot = path.resolve ('./packages/products/');
exports.loktharRoot     = path.resolve ('./lokthar/');
exports.nodeModulesRoot = path.resolve ('./node_modules/');
