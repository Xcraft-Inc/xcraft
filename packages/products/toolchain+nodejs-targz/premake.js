'use strict';

module.exports = function (packagePath, sharePath) {
  var path = require ('path');

  var packageName  = path.basename (__dirname);
  var utils        = require ('xcraft-core-utils');
  var xcraftConfig = require ('xcraft-core-etc').load ('xcraft');
  var pacmanConfig = require ('xcraft-core-etc').load ('xcraft-contrib-pacman');
  var xLog         = require ('xcraft-core-log') (packageName);

  var pkgDefFile = path.join ( xcraftConfig.pkgProductsRoot,
                              packageName,
                              pacmanConfig.pkgCfgFileName
                            );

  var packageDef = utils.yamlFile2Json (pkgDefFile);

  var npmInstall = function (callbackDone) {
    var zogPlatform = require ('xcraft-core-platform');
    var zogProcess  = require ('xcraft-core-process');
    var zogFs       = require ('xcraft-core-fs');

    /* prefix to /usr/share */
    var nodeModules = path.join (sharePath, '..');
    zogFs.mkdir (nodeModules);

    var npm = 'npm' + zogPlatform.getCmdExt ();
    var args =
    [
      'install',
      '--prefix', nodeModules,
      'tar.gz@' + packageDef.version
    ];

    zogProcess.spawn (npm, args, function (done) {
      callbackDone (done);
    }, function (line) {
      xLog.verb (line);
    }, function (line) {
      xLog.err (line);
    });
  };

  return {
    copy: function (callbackDone) {
      npmInstall (callbackDone);
    }
  };
};
