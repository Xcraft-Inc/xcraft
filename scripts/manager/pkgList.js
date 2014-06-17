
var moduleName = 'manager';

var path       = require ('path');
var zogFs      = require ('../lib/zogFs.js');
var zogConfig  = require ('../zogConfig.js');
var zogLog     = require ('../lib/zogLog.js')(moduleName);


/**
 * \brief return a product packages list
 *
 *
 */
exports.listProducts = function ()
{
  var products    = [];
  var yaml        = require ('js-yaml');
  var fs          = require ('fs');
  var packagesDir = zogFs.lsdir (zogConfig.pkgProductsRoot);

  for(var p in packagesDir)
  {
    var configFilePath = path.join(zogConfig.pkgProductsRoot, packagesDir[p],'/config.yaml');
    var doc            = yaml.safeLoad(fs.readFileSync(configFilePath, 'utf8'));
    products.push(doc);
  }

  return products;
}
