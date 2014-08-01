
var moduleName = 'grunt';

var path = require ('path');

var zogConfig  = require ('./scripts/zogConfig.js') ();
var zogFs      = require ('zogFs');
var zogLog     = require ('zogLog') (moduleName);
var pkgControl = require (zogConfig.libPkgControl);
var pkgMake    = require (zogConfig.libPkgMake);

var initNewer = function ()
{
  var list = {};
  var srcYaml = zogFs.lsdir (zogConfig.pkgProductsRoot);

  /* Loop for each package available in the products directory. */
  srcYaml.forEach (function (packageName)
  {
    var destControl = pkgControl.controlFiles (packageName, false);

    var i = 0;
    /* Loop for each control file path. */
    destControl.forEach (function (controlFile)
    {
      /* Retrieve the architecture with the control file location. */
      var arch = path.basename (path.resolve (controlFile, path.join ('../../..')));

      list[packageName + '/' + arch] =
      {
        src: path.join (zogConfig.pkgProductsRoot, packageName, zogConfig.pkgCfgFileName),
        dest: controlFile,
        options:
        {
          tasks: [ 'zogMake:' + packageName + '/' + arch ]
        }
      };
      i++;
    });
  });

  return list;
};

var listNewer = initNewer ();

module.exports = function (grunt)
{
  grunt.initConfig (
  {
    zogMake: {},
    newer: listNewer
  });

  grunt.loadNpmTasks ('grunt-newer-explicit');

  grunt.registerTask ('zogMake', 'Task to make control files on newer versions.', function (target)
  {
    var done = this.async ();
    var packageName = target.replace (/\/.*/, '');
    var arch        = target.replace (/.*\//, '');

    zogLog.info ('make the control file for ' + packageName + ' on ' + arch);

    /* Note that this pkgMake will make all architectures for this package.
     * Then, the next targets provided by the newer module against the control
     * files will return "Nothing change" for this package.
     * The best way will be to make only the package by architecture. It should
     * be a second argument for pkgMake().
     */
    pkgMake.package (packageName, function (error)
    {
      done (error);
    });
  });
};
