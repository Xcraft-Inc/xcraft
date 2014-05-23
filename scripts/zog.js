#!/usr/bin/env node

var program = require ('commander');
var zogWpkg = require ('./zogWpkg.js');
var zogManager = require ('./zogManager.js');

process.chdir (__dirname + '/..');
program
  .version ('0.0.1')
  .option ('-w, --wpkg [action]', 'manage the wpkg installation', zogWpkg.action)
  .option ('create [package]', 'create a new empty package', zogManager.create)
  .parse (process.argv);
