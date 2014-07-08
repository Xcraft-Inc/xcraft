#!/usr/bin/env node
'use strict';

var program = require ('commander');
var path    = require ('path');
var clc     = require ('cli-color');

var zogManager = require ('./zogManager.js');
var zogWpkg    = require ('./zogWpkg.js');
var zogLokthar = require ('./zogLokthar.js');
var zogChest   = require ('./zogChest.js');
var zogLog     = require ('zogLog') ('zog');
var zogConfig  = require ('./zogConfig.js') ();

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
  .option ('-n, --nocolor', 'disable the color output')
  .option ('-w, --wpkg <action>', 'manage the wpkg installation '
           + argsPrettify (zogWpkg.args), zogWpkg.action)
  .option ('-l, --lokthar <action>', 'manage the lokthar installation '
           + argsPrettify (zogLokthar.args), zogLokthar.action)
  .option ('-c, --chest <action> [file]', 'manage a file chest '
           + argsPrettify (zogChest.args) + '\n')

  .option ('configure', 'change settings', zogConfig.configure)
  .option ('create <package>', 'create or edit a package definition', zogManager.create)
  .option ('make [package]', 'make all or only the [package]')
  .option ('install <package:arch>', 'install the <package>', zogManager.install)
  .option ('clean', 'remove the devroot, the repository and the packages', zogManager.clean);

program.on ('--help', function ()
{
  console.log ('  Informations:');
  console.log ('');
  console.log ('    Please be careful when using `zog clean` because the installed packages');
  console.log ('    are not removed properly. For example, if a MSI was installed by a package,');
  console.log ('    it will remains in the system. The reason is that only the devroot/ is');
  console.log ('    deleted regardless of wpkg.');
  console.log ('');
  console.log ('  Examples:');
  console.log ('');
  console.log ('    $ zog --lokthar install');
  console.log ('    $ zog -l run');
  console.log ('    $ zog create libfoobar');
  console.log ('    $ zog -v 0 make');
  console.log ('');
});

program.parse (process.argv);

if (program.nocolor)
  zogLog.color (false);
if (program.make)
  zogManager.make (program.make === true ? false : program.make);
if (program.chest)
  zogChest.action (program.chest, program.args[0] || null);
