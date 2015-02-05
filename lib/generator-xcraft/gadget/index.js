'use strict';
var yeoman = require ('yeoman-generator');
var path   = require ('path');

module.exports = yeoman.generators.Base.extend({
  initializing: function () {
    this.pkg = require ('../package.json');
  },

  writing: {
    app: function () {
      var context = {
       gadgetName: this.appname
      };

      this.fs.copy(
        this.templatePath('main.jsx'),
        this.destinationPath('main.jsx')
      );
      this.fs.copyTpl(
        this.templatePath('index.html'),
        this.destinationPath('index.html'),
        context
      );
      this.fs.copyTpl(
        this.templatePath('app.jsx'),
        this.destinationPath('app.jsx'),
        context
      );
      this.fs.copyTpl(
        this.templatePath('gadget.js'),
        this.destinationPath('gadget.js'),
        context
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
      var context = {
       gadgetName: this.appname
      };

      this.fs.copyTpl (
        this.templatePath('_package.json'),
        this.destinationPath('package.json'),
        context
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
