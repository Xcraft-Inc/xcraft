#!/usr/bin/env node

var program = require ('commander');
var path    = require ('path');

var zogManager = require ('./zogManager.js');
var zogWpkg    = require ('./zogWpkg.js');
var zogLokthar = require ('./zogLokthar.js');
var zogLog     = require ('./lib/zogLog.js')('zog');

// Display help if zog is called without argument.
if (process.argv.length < 3)
  process.argv.push ('-h');

program
  .version ('0.0.1')
  .option ('-v, --verbosity <level>', 'change the verbosity level [0..3] (default: 0)', zogLog.verbosity)
  .option ('-w, --wpkg <action>', 'manage the wpkg installation', zogWpkg.action)
  .option ('-l, --lokthar <action>', 'manage the lokthar installation', zogLokthar.action)
  .option ('create <package>', 'create a new empty package', zogManager.create)
  .parse (process.argv);
