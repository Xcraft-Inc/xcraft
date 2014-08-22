'use strict';

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
    var destControl = pkgControl.controlFiles (packageName, null, false);

    /* Loop for each control file path. */
    destControl.forEach (function (controlFile)
    {
      list[packageName + '/' + controlFile.arch] =
      {
        src: path.join (zogConfig.pkgProductsRoot, packageName, zogConfig.pkgCfgFileName),
        dest: controlFile.control,
        options:
        {
          tasks: [ 'zogMake:' + packageName + '/' + controlFile.arch ]
        }
      };
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
    newer: listNewer,

    jshint:
    {
      options:
      {
        jshintrc: '.jshintrc',
        extract:'always'
      },
      all:
      {
        src:
        [
          './scripts/**.html',
          './scripts/**.htm',
          './lokthar/lokthar-app/**.html',
          './lokthar/lokthar-app**.htm',
          './node_modules/zog**.html',
          './node_modules/zog**.htm',
          './tests/**.html',
          './tests/**.htm',
        ]
      }
    },

    jshint2:
    {
      options:
      {
        jshintrc: '.jshintrc'
      },
      all:
      {
        src:
        [
          './Gruntfile.js',
          './scripts/**.js',
          './lokthar/lokthar-app/**.js',
          './node_modules/zog**.js',
          './packages/products/**.js',
          './tests/**.js',
        ]
      }
    },
  });

  grunt.loadNpmTasks ('grunt-contrib-jshint');
  grunt.loadNpmTasks ('grunt-jshint2');
  grunt.loadNpmTasks ('grunt-newer-explicit');

  grunt.registerTask ('zogMake', 'Task to make control files on newer versions.', function (target)
  {
    var done = this.async ();
    var packageName = target.replace (/\/.*/, '');
    var arch        = target.replace (/.*\//, '');

    zogLog.info ('make the control file for ' + packageName + ' on ' + arch);

    pkgMake.package (packageName, arch, function (error)
    {
      done (error);
    });
  });
};
