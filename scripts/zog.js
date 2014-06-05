#!/usr/bin/env node

var program = require ('commander');
var path    = require ('path');

var zogWpkg    = require ('./zogWpkg.js');
var zogLokthar = require ('./zogLokthar.js');
var zogManager = require ('./zogManager.js');

process.chdir (path.join (__dirname, '/..'));
program
  .version ('0.0.1')
  .option ('-w, --wpkg <action>', 'manage the wpkg installation', zogWpkg.action)
  .option ('-l, --lokthar <action>', 'manage the lokthar installation', zogLokthar.action)
  .option ('create <package>', 'create a new empty package', zogManager.create)
  .parse (process.argv);
