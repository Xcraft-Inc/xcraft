#!/usr/bin/env node
'use strict';

var program = require ('commander');
var path    = require ('path');
var clc     = require ('cli-color');

var zogLog     = require ('zogLog') ('zog');
var zogManager = require ('./zogManager.js');
var zogCMake   = require ('./zogCMake.js');
var zogWpkg    = require ('./zogWpkg.js');
var zogLokthar = require ('./zogLokthar.js');
var zogChest   = require ('./zogChest.js');
var zogConfig  = require ('./zogConfig.js') ();
var zogBoot    = require ('./zogBoot.js');


var argsPrettify = function (args)
{
  var list = [];

  args ().forEach (function (cmd)
  {
    list.push (cmd.name);
  });

  return clc.cyan ('[' + list.join (', ') + ']');
};

program
  .version ('0.0.1')
  .option ('-v, --verbosity <level>', 'change the verbosity level [0..3] (default: 1)', zogLog.verbosity)
  .option ('-n, --nocolor', 'disable the color output')

  .option ('-m, --cmake <action>', 'manage the cmake installation '
           + argsPrettify (zogCMake.busCommands))
  .option ('-w, --wpkg <action>', 'manage the wpkg installation '
           + argsPrettify (zogWpkg.busCommands))
  .option ('-l, --lokthar <action>', 'manage the lokthar installation '
           + argsPrettify (zogLokthar.busCommands))
  .option ('-c, --chest <action> [file]', 'manage a file chest '
           + argsPrettify (zogChest.busCommands) + '\n')

  .option ('configure', 'change settings')
  .option ('list', 'list all available packages')
  .option ('create <package>', 'create or edit a package definition')
  .option ('make [package]', 'make all or only the [package]')
  .option ('install <package:arch>', 'install the <package>')
  .option ('remove <package:arch>', 'remove the <package>')
  .option ('clean', 'remove the devroot, the repository and the packages');

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

/* Display help if zog is called without command arguments. */
var length = 3;
if (program.verbosity)
  length++;
if (program.nocolor)
  length++;
if (process.argv.length < length)
  program.help (); /* Print help and exits immediatly. */

/**
 * The main is called as soon as the zog booting process is terminated.
 * @param {boolean} done - False on error.
 */
var main = function (done)
{
  if (!done)
  {
    zogLog.err ('fatal error with zog booting');
    process.exit (1);
  }

  var busClient = require (zogConfig.busClient);

  var mainShutdown = function ()
  {
    zogLog.info ('end command');

    busClient.stop (function (done)
    {
      zogBoot.stop ();
    });
  };

  /* Global error handler for command errors. */
  require ('./bus/busCommander.js').registerErrorHandler (mainShutdown);

  if (program.cmake)
    busClient.command.send ('zogCMake.' + program.cmake, null, mainShutdown);
  if (program.wpkg)
    busClient.command.send ('zogWpkg.' + program.wpkg, null, mainShutdown);
  if (program.lokthar)
    busClient.command.send ('zogLokthar.' + program.lokthar, null, mainShutdown);
  if (program.chest)
    busClient.command.send ('zogChest.' + program.chest, program.args[0] || null, mainShutdown);
  if (program.configure)
    zogConfig.configure ();
  if (program.list)
    busClient.command.send ('zogManager.list', null, mainShutdown);
  if (program.create)
    zogManager.create (program.create);
  if (program.make)
    zogManager.make (program.make === true ? false : program.make);
  if (program.install)
    zogManager.install (program.install);
  if (program.remove)
    zogManager.remove (program.remove);
  if (program.clean)
    zogManager.clean (program.clean);
};

zogBoot.start (main);
