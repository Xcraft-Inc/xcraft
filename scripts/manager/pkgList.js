'use strict';

var zogConfig     = require ('../zogConfig.js') ();
var zogFs         = require ('zogFs');
var pkgDefinition = require (zogConfig.libPkgDefinition);

/**
 * Return a product packages list.
 * @returns {string[]} The list of packages.
 */
exports.listProducts = function () {
  var products    = [];
  var packagesDir = zogFs.lsdir (zogConfig.pkgProductsRoot);

  packagesDir.forEach (function (pkg) {
    var doc = pkgDefinition.load (pkg);
    products.push (doc);
  });

  return products;
};
