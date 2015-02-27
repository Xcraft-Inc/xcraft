'use strict';
var yeoman = require ('yeoman-generator');
var path   = require ('path');

module.exports = yeoman.generators.Base.extend ({
  initializing: function () {
    this.pkg = require ('../package.json');
  },

  writing: {
    app: function () {
      var context = {
       gadgetName: this.appname
      };

      this.fs.copy (
        this.templatePath ('main.jsx'),
        this.destinationPath ('main.jsx')
      );
      this.fs.copyTpl (
        this.templatePath ('index.html'),
        this.destinationPath ('index.html'),
        context
      );
      this.fs.copyTpl (
        this.templatePath ('app.jsx'),
        this.destinationPath ('app.jsx'),
        context
      );
      this.fs.copyTpl (
        this.templatePat ('gadget.js'),
        this.destinationPat ('gadget.js'),
        context
      );
      this.fs.cop (
        this.templatePat ('home.jsx'),
        this.destinationPat ('home.jsx')
      );
      this.fs.cop (
        this.templatePat ('main.less'),
        this.destinationPat ('main.less')
      );
      this.fs.cop (
        this.templatePat ('app.less'),
        this.destinationPat ('app.less')
      );
      this.fs.cop (
        this.templatePat ('vars.less'),
        this.destinationPat ('vars.less')
      );
    },

    projectfiles: function () {
      var context = {
       gadgetName: this.appname
      };

      this.fs.copyTpl (
        this.templatePat ('_package.json'),
        this.destinationPat ('package.json'),
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
      this.fs.cop (
        this.templatePat ('webpack.prod.js'),
        this.destinationPat ('webpack.prod.js')
      );
      this.fs.cop (
        this.templatePat ('webpack.xdk.js'),
        this.destinationPat ('webpack.xdk.js')
      );
    }
  },

  install: function () {
    this.npmInstall ('.', {
      registry: 'http://localhost:8485'
    });
  }
});
