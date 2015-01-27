'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');

module.exports = yeoman.generators.Base.extend({
  initializing: function() {
    this.pkg = require('../package.json');
  },

  prompting: function() {
    var done = this.async();

    // Have Yeoman greet the user.
    this.log(yosay(
      chalk.red('Zog Zog Goblin Gadget!')
    ));

    var prompts = [{
      type: 'confirm',
      name: 'someOption',
      message: 'Would you like to enable this option?',
      default: true
    }];

    this.prompt(prompts, function(props) {
      this.someOption = props.someOption;

      done();
    }.bind(this));
  },

  writing: {
    app: function() {
      this.fs.copy(
        this.templatePath('_package.json'),
        this.destinationPath('package.json')
      );
      this.fs.copy(
        this.templatePath('index.html'),
        this.destinationPath('index.html')
      );
      this.fs.copy(
        this.templatePath('webpack.prod.js'),
        this.destinationPath('webpack.prod.js')
      );
      this.fs.copy(
        this.templatePath('webpack.xdk.js'),
        this.destinationPath('webpack.xdk.js')
      );
    },

    projectfiles: function() {
      this.fs.copy(
        this.templatePath('editorconfig'),
        this.destinationPath('.editorconfig')
      );
      this.fs.copy(
        this.templatePath('jshintrc'),
        this.destinationPath('.jshintrc')
      );
    }
  },

  install: function() {
    this.installDependencies({
      skipInstall: this.options['skip-install']
    });
  }
});
