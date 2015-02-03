'use strict';
var yeoman = require('yeoman-generator');

module.exports = yeoman.generators.Base.extend({
  initializing: function () {
    this.pkg = require('../package.json');
  },

  writing: {
    app: function () {
      this.fs.copy(
        this.templatePath('main.jsx'),
        this.destinationPath('main.jsx')
      );
      this.fs.copy(
        this.templatePath('index.html'),
        this.destinationPath('index.html')
      );
      this.fs.copy(
        this.templatePath('app.jsx'),
        this.destinationPath('app.jsx')
      );
      this.fs.copy(
        this.templatePath('home.jsx'),
        this.destinationPath('home.jsx')
      );
      this.fs.copy(
        this.templatePath('main.less'),
        this.destinationPath('main.less')
      );
      this.fs.copy(
        this.templatePath('app.less'),
        this.destinationPath('app.less')
      );
      this.fs.copy(
        this.templatePath('vars.less'),
        this.destinationPath('vars.less')
      );
    },

    projectfiles: function () {
      this.fs.copy(
        this.templatePath('_package.json'),
        this.destinationPath('package.json')
      );
      this.fs.copy (
        this.templatePath ('_gitignore'),
        this.destinationPath ('.gitignore')
      );
      this.fs.copy (
        this.templatePath ('editorconfig'),
        this.destinationPath ('.editorconfig')
      );
      this.fs.copy (
        this.templatePath ('jshintrc'),
        this.destinationPath ('.jshintrc')
      );
      this.fs.copy(
        this.templatePath('webpack.prod.js'),
        this.destinationPath('webpack.prod.js')
      );
      this.fs.copy(
        this.templatePath('webpack.xdk.js'),
        this.destinationPath('webpack.xdk.js')
      );
    }
  },

  install: function () {
    this.npmInstall ('.', {
      registry: 'http://localhost:8485'
    });
  }
});
