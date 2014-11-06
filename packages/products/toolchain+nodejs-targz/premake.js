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
    var xPlatform = require ('xcraft-core-platform');
    var xProcess  = require ('xcraft-core-process');
    var xFs       = require ('xcraft-core-fs');

    /* prefix to /usr/share */
    var nodeModules = path.join (sharePath, '..');
    xFs.mkdir (nodeModules);

    var npm = 'npm' + xPlatform.getCmdExt ();
    var args =
    [
      'install',
      '--prefix', nodeModules,
      'tar.gz@' + packageDef.version
    ];

    xProcess.spawn (npm, args, function (done) {
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
