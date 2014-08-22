'use strict';

var moduleName = 'manager';

var path = require ('path');

var zogConfig     = require ('../zogConfig.js') ();
var zogFs         = require ('zogFs');
var zogLog        = require ('zogLog') (moduleName);
var pkgDefinition = require (zogConfig.libPkgDefinition);

/**
 * Return a product packages list.
 * @returns {string[]} The list of packages.
 */
exports.listProducts = function ()
{
  var products    = [];
  var packagesDir = zogFs.lsdir (zogConfig.pkgProductsRoot);

  for (var p in packagesDir)
  {
    var doc = pkgDefinition.load (packagesDir[p]);
    products.push (doc);
  }

  return products;
};
