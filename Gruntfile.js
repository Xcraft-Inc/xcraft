'use strict';

var moduleName = 'grunt';

var path = require ('path');
var fs   = require ('fs');

var zogConfig  = require ('./scripts/zogConfig.js') ();
var zogFs      = require ('xcraft-core-fs');
var zogLog     = require ('xcraft-core-log') (moduleName);
var pkgControl = require (zogConfig.libPkgControl);
var pkgMake    = require (zogConfig.libPkgMake);

var initNewer = function () {
  var list = {};
  var srcYaml = zogFs.lsdir (zogConfig.pkgProductsRoot);

  /* Loop for each package available in the products directory. */
  srcYaml.forEach (function (packageName) {
    var destControl = pkgControl.controlFiles (packageName, null, false);

    /* Loop for each control file path. */
    destControl.forEach (function (controlFile) {
      list[packageName + '/' + controlFile.arch] = {
        src: path.join (zogConfig.pkgProductsRoot, packageName, zogConfig.pkgCfgFileName),
        dest: controlFile.control,
        options: {
          tasks: ['zogMake:' + packageName + '/' + controlFile.arch]
        }
      };
    });
  });

  return list;
};

var listNewer = initNewer ();

module.exports = function (grunt) {
  var jsSrc = [
    './Gruntfile.js',
    './scripts/**/*.js',
    './lokthar/lokthar-app/*.js',
    './lokthar/lokthar-app/modules/**/*.js',
    '!./lokthar/lokthar-app/js',
    './node_modules/zog**/**/*.js',
    './packages/products/**/*.js',
    './tests/**/*.js',
  ];

  grunt.initConfig ({
    zogMake: {},
    newer: listNewer,

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: {
        src: jsSrc
      }
    },

    jscs: {
      options: {
        config: '.jscsrc'
      },
      src: jsSrc
    }
  });

  if (fs.existsSync ('./node_modules/grunt-contrib-jshint')) {
    grunt.loadNpmTasks ('grunt-contrib-jshint');
  }
  if (fs.existsSync ('./node_modules/grunt-jscs')) {
    grunt.loadNpmTasks ('grunt-jscs');
  }
  grunt.loadNpmTasks ('grunt-newer-explicit');

  grunt.registerTask ('zogMake', 'Task to make control files on newer versions.', function (target) {
    var done = this.async ();
    var packageName = target.replace (/\/.*/, '');
    var arch        = target.replace (/.*\//, '');

    zogLog.info ('make the control file for ' + packageName + ' on ' + arch);

    pkgMake.package (packageName, arch, function (error) {
      done (error);
    });
  });
};
