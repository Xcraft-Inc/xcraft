'use strict';

var moduleName = 'manager';

var path       = require ('path');
var zogConfig  = require ('../zogConfig.js') ();
var zogFs      = require ('zogFs');
var zogLog     = require ('zogLog') (moduleName);
var pkgControl = require ('./pkgControl.js');

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
    var doc = pkgControl.loadPackageDef (packagesDir[p]);
    products.push (doc);
  }

  return products;
}
