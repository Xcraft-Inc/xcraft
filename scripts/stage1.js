#!/usr/bin/env node
'use strict';

var moduleName = 'stage1';

var sys = require ('sys');
var zogProcess = require ('zogProcess');
var zogPlatform = require ('zogPlatform');

var depsForZog = [
  'cli-color',
  'commander',
  'decompress',
  'express',
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
  'wrench'
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
 * The second stage installs wpkg.
 */
var stage2 = function ()
{
  console.log ('[' + moduleName + '] Info: end of stage one');

  var util = require ('util');
  var zogLog = require ('zogLog') ('stage2');
  zogLog.verbosity (0);

  zogLog.info ('install wpkg');
  var zog = util.format ('%szog%s',
                         zogPlatform.getOs () !== 'win' ? './' : '',
                         zogPlatform.getCmdExt ());
  var args =
  [
    '-v0',
    '-w',
    'install'
  ];

  zogProcess.spawn (zog, args, null, function (line)
  {
    console.log (line);
  }, function (line)
  {
    console.log (line);
  });
}

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
