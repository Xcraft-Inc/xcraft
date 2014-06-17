
var moduleName = 'manager';

var path       = require ('path');
var zogConfig  = require ('../zogConfig.js');
var zogFs      = require ('../lib/zogFs.js');
var zogLog     = require ('../lib/zogLog.js')(moduleName);
var pkgControl = require ('./pkgControl.js');

/**
 * \brief return a product packages list
 */
exports.listProducts = function ()
{
  var products    = [];
  var yaml        = require ('js-yaml');
  var fs          = require ('fs');
  var packagesDir = zogFs.lsdir (zogConfig.pkgProductsRoot);

  for (var p in packagesDir)
  {
    var doc = pkgControl.loadPackageDef (packagesDir[p]);
    products.push (doc);
  }

  return products;
}
