#!/usr/bin/env node

var moduleName = 'stage1';

var sys    = require ('sys');
var exec   = require ('child_process').exec;

var depsForZog = [
  'cli-color',
  'commander',
  'grunt',
  'grunt-cli',
  'grunt-newer-explicit',
  'inquirer',
  'js-yaml'
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
function stage2(error, stdout, stderr)
{
  console.log ('[' + moduleName + '] Verb: zog dependencies outputs:\n' + stdout);

  if (error === null)
  {
    console.log ('[' + moduleName + '] Info: end of stage one');

    var zogLog = require ('./lib/zogLog.js')('stage2');
    exec ('zog -w install', function (error, stdout, stderr)
    {
      zogLog.verb ('wpkg install outputs:\n' + stdout);
    });
  }
  else
    console.log ('[' + moduleName + '] Err: unable to install zog depedencies\n' + stderr);
}

console.log ('[' + moduleName + '] Info: install zog dependencies');
try
{
  var list = depsForZog.toString ().replace (/,/g, ' ');
  exec ('npm install ' + list, stage2);
}
catch (err)
{
  console.log ('[' + moduleName + '] Err: ' + err);
}
