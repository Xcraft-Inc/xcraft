'use strict';

var moduleName = 'manager';

var path      = require ('path');
var zogConfig = require ('../zogConfig.js') ();
var zogLog    = require ('xcraft-core-log') (moduleName);


exports.load = function (packageName) {
  var pkgConfig = path.join (zogConfig.pkgProductsRoot, packageName, zogConfig.pkgCfgFileName);

  var yaml = require ('js-yaml');
  var fs   = require ('fs');

  var data = fs.readFileSync (pkgConfig, 'utf8');

  var def = yaml.safeLoad (data);
  zogLog.verb ('JSON output (package):\n' + JSON.stringify (def, null, '  '));

  return def;
};
