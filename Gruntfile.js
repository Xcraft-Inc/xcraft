'use strict';

var fs   = require ('fs');

module.exports = function (grunt) {
  var jsSrc = [
    './Gruntfile.js',
    './scripts/**/*.js',
    './lokthar/lokthar-app/*.js',
    './lokthar/lokthar-app/modules/**/*.js',
    '!./lokthar/lokthar-app/js',
    './node_modules/xcraft**/**/*.js',
    './packages/products/**/*.js',
    './tests/**/*.js',
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
