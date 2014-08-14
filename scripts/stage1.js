#!/usr/bin/env node
'use strict';

var moduleName = 'stage1';

var sys         = require ('sys');
var zogProcess  = require ('zogProcess');
var zogPlatform = require ('zogPlatform');

var depsForZog =
[
  'async',
  'axon',
  'cli-color',
  'commander',
  'express',
  'fs-extra',
  'grunt',
  'grunt-cli',
  'grunt-newer-explicit',
  'inquirer',
  'js-yaml',
  'progress',
  'progress-stream',
  'request',
  'socket.io',
  'socket.io-client',
  'tar',
  'tar.gz'
];

try
{
  process.chdir (__dirname + '/..');
  console.log ('[' + moduleName + '] Info: go to the toolchain directory: ' + process.cwd ());
}
catch (err)
{
  console.log ('[' + moduleName + '] Err: ' + err);
}

/**
 * The second stage installs cmake and wpkg.
 */
var stage2 = function ()
{
  console.log ('[' + moduleName + '] Info: end of stage one');

  var util = require ('util');
  var zogLog = require ('zogLog') ('stage2');
  zogLog.verbosity (0);

  /* Locations of the sysroot/ binaries. */
  if (process.argv.length > 2)
  {
    var path      = require ('path');
    var zogConfig = require ('./zogConfig.js') ();

    var list = [];
    process.argv.slice (2).forEach (function (location)
    {
      list.push (path.resolve (location));
    });

    var zogrc =
    {
      'path': list
    };

    var fs = require ('fs');
    fs.writeFileSync (zogConfig.zogRc, JSON.stringify (zogrc, null, '  '));
  }

  var zog = util.format ('%szog%s',
                         zogPlatform.getOs () !== 'win' ? './' : '',
                         zogPlatform.getCmdExt ());

  var async = require ('async');

  async.eachSeries ([ '--cmake', '--wpkg' ], function (action, callback)
  {
    zogLog.info ('install %s', action.replace (/^--/, ''));

    var args =
    [
      '-v0',
      action,
      'install'
    ];

    zogProcess.spawn (zog, args, function (done)
    {
      callback ();
    });
  });
};

console.log ('[' + moduleName + '] Info: install zog dependencies');
try
{
  var npm = 'npm' + zogPlatform.getCmdExt ();
  var args = [ 'install' ];
  args = args.concat (depsForZog);

  zogProcess.spawn (npm, args, function (done)
  {
    stage2 ();
  }, function (line)
  {
    console.log ('[' + moduleName + '] Verb: ' + line);
  }, function (line)
  {
    console.log ('[' + moduleName + '] Err: ' + line);
  });
}
catch (err)
{
  console.log ('[' + moduleName + '] Err: ' + err);
}
