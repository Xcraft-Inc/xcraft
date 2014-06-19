#!/usr/bin/env node

var program = require ('commander');
var path    = require ('path');
var clc     = require ('cli-color');

var zogManager = require ('./zogManager.js');
var zogWpkg    = require ('./zogWpkg.js');
var zogLokthar = require ('./zogLokthar.js');
var zogLog     = require ('./lib/zogLog.js')('zog');

// Display help if zog is called without argument.
if (process.argv.length < 3)
  process.argv.push ('-h');

var argsPrettify = function (args)
{
  return clc.blackBright ('[' + args ().toString ().replace (/,/g, ', ') + ']');
}

program
  .version ('0.0.1')
  .option ('-v, --verbosity <level>', 'change the verbosity level [0..3] (default: 1)', zogLog.verbosity)
  .option ('-w, --wpkg <action>', 'manage the wpkg installation '
           + argsPrettify (zogWpkg.args), zogWpkg.action)
  .option ('-l, --lokthar <action>', 'manage the lokthar installation '
           + argsPrettify (zogLokthar.args) + '\n', zogLokthar.action)

  .option ('create <package>', 'create a new empty package', zogManager.create)
  .option ('make [package]', 'make all or only the [package]')
  .parse (process.argv);

if (program.make)
  zogManager.make (program.make === true ? false : program.make);
