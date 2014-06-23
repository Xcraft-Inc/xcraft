#!/usr/bin/env node

var program = require ('commander');
var path    = require ('path');
var clc     = require ('cli-color');

var zogManager = require ('./zogManager.js');
var zogWpkg    = require ('./zogWpkg.js');
var zogLokthar = require ('./zogLokthar.js');
var zogChest   = require ('./zogChest.js');
var zogLog     = require ('./lib/zogLog.js')('zog');

/* Display help if zog is called without argument. */
if (process.argv.length < 3)
  process.argv.push ('-h');

var argsPrettify = function (args)
{
  return clc.cyan ('[' + args ().toString ().replace (/,/g, ', ') + ']');
}

program
  .version ('0.0.1')
  .option ('-v, --verbosity <level>', 'change the verbosity level [0..3] (default: 1)', zogLog.verbosity)
  .option ('-w, --wpkg <action>', 'manage the wpkg installation '
           + argsPrettify (zogWpkg.args), zogWpkg.action)
  .option ('-l, --lokthar <action>', 'manage the lokthar installation '
           + argsPrettify (zogLokthar.args), zogLokthar.action)
  .option ('-c, --chest <action> [file]', 'manage a file chest '
           + argsPrettify (zogChest.args) + '\n')

  .option ('create <package>', 'create a new empty package', zogManager.create)
  .option ('make [package]', 'make all or only the [package]');

program.on ('--help', function ()
{
  console.log ('  Examples:');
  console.log ('');
  console.log ('    $ zog --lokthar install');
  console.log ('    $ zog -l run');
  console.log ('    $ zog create libfoobar');
  console.log ('    $ zog -v 0 make');
  console.log ('');
});

program.parse (process.argv);

if (program.make)
  zogManager.make (program.make === true ? false : program.make);
if (program.chest)
  zogChest.action (program.chest, program.args[0] || null);
