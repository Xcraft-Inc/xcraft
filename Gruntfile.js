
var moduleName = 'grunt';

var path = require ('path');

var zogConfig  = require ('./scripts/zogConfig.js');
var zogFs      = require (path.join (zogConfig.libRoot, 'zogFs.js'));
var zogLog     = require (path.join (zogConfig.libRoot, 'zogLog.js'))(moduleName);
var pkgControl = require (zogConfig.libPkgControl);

module.exports = function (grunt)
{
  var srcYaml = zogFs.lsdir (zogConfig.pkgProductsRoot);

  var initNewer = {};
  srcYaml.forEach (function (packageName)
  {
    var destControl = pkgControl.controlFiles (packageName, false);

    var i = 0;
    destControl.forEach (function (controlFile)
    {
      initNewer[packageName + '.Arch[' + i.toString () +']'] =
      {
        src: path.join (zogConfig.pkgProductsRoot, packageName, zogConfig.pkgCfgFileName),
        dest: controlFile,
        options:
        {
          tasks: [ 'zogMake:' + packageName]
        }
      };
      i++;
    });
  });

  grunt.initConfig (
  {
    zogMake: {},
    newer: initNewer
  });

  grunt.loadNpmTasks ('grunt-newer-explicit');

  grunt.registerTask ('zogMake', 'Task to make control files on newer versions.', function (target)
  {
    zogLog.info ('make the control file for ' + target);
    pkgControl.pkgMake (target);
  });

  grunt.registerTask('default', ['newer']);
};
