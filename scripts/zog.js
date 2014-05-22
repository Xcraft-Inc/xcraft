#!/usr/bin/env node

var program = require ('commander');
var zogWpkg = require ('./zogWpkg.js');

var wpkg = new zogWpkg.wpkgManager ('wpkg');

process.chdir (__dirname + '/..');
program
  .version ('0.0.1')
  .option ('-w, --wpkg [action]', 'Manage the wpkg installation', wpkg.action)
  .parse (process.argv);
