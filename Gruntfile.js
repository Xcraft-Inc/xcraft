'use strict';

var fs = require ('fs');

module.exports = function (grunt) {
  var jsSrc = [
    './Gruntfile.js',
    './scripts/*.js',
    './packages/products/**/*.js',
    './tests/**/*.js',
    './lib/xcraft-core-*/*.js',
    './lib/xcraft-contrib-chest/**/*.js',
    './lib/xcraft-contrib-cmake/**/*.js',
    './lib/xcraft-contrib-lokthar/lokthar-app/*.js',
    './lib/xcraft-contrib-lokthar/lokthar-app/modules/**/*.js',
    './lib/xcraft-contrib-pacman/**/*.js',
    './lib/xcraft-contrib-wpkg/**/*.js',
    './lib/xcraft-core-*/**/*.js',
    './lib/xcraft-zog/**/*.js'
  ];

  grunt.initConfig ({
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
};
