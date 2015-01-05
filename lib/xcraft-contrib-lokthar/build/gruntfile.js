'use strict';

module.exports = function (grunt) {
  grunt.initConfig({
    'build-atom-shell': {
      tag: 'v0.19.5',
      nodeVersion: '0.18.0',
      buildDir: __dirname,
      projectName: 'lokthar',
      productName: 'Lokthar'
    }
  });

  grunt.loadNpmTasks('grunt-build-atom-shell');
};
