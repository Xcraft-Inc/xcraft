
var moduleName = 'grunt';

var path = require ('path');

var zogConfig  = require ('./scripts/zogConfig.js')();
var zogFs      = require (path.join (zogConfig.libRoot, 'zogFs.js'));
var zogLog     = require (path.join (zogConfig.libRoot, 'zogLog.js'))(moduleName);
var pkgControl = require (zogConfig.libPkgControl);
var pkgMake    = require (zogConfig.libPkgMake);

module.exports = function (grunt)
{
  var srcYaml = zogFs.lsdir (zogConfig.pkgProductsRoot);

  var initNewer = {};
  /* Loop for each package available in the products directory. */
  srcYaml.forEach (function (packageName)
  {
    var destControl = pkgControl.controlFiles (packageName, false);

    var i = 0;
    /* Loop for each control file path. */
    destControl.forEach (function (controlFile)
    {
      initNewer[packageName + '.Arch[' + i.toString () +']'] =
      {
        src: path.join (zogConfig.pkgProductsRoot, packageName, zogConfig.pkgCfgFileName),
        dest: controlFile,
        options:
        {
          tasks: [ 'zogMake:' + packageName ]
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
    var done = this.async ();

    zogLog.info ('make the control file for ' + target);

    /* Note that this pkgMake will make all architectures for this package.
     * Then, the next targets provided by the newer module against the control
     * files will return "Nothing change" for this package.
     * The best way will be to make only the package by architecture. It should
     * be a second argument for pkgMake().
     */
    pkgMake.package (target);
  });
};
