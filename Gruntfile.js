'use strict';

var fs = require ('fs');

module.exports = function (grunt) {
  var jsSrc = [
    './Gruntfile.js',
    './packages/**/*.js',
    './tests/**/*.js',
    './lib/xcraft*/**/*.js',
    './home/xdk/xcraft*/**/*.js'
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
