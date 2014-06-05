#!/usr/bin/env node

var moduleName = 'stage1';

var sys    = require ('sys');
var exec   = require ('child_process').exec;
var zogLog = require ('./lib/zogLog.js')(moduleName);

try
{
  process.chdir (__dirname + '/..');
  zogLog.info ('go to the toolchain directory: ' + process.cwd ());
}
catch (err)
{
  zogLog.err (err);
}

function stage2(error, stdout, stderr)
{
  sys.puts (stdout);
  
  if (error === null)
  {
    zogLog.info ('end of stage one');
    exec ('zog -w install', function (error, stdout, stderr)
    {
      sys.puts (stdout)
    });
  }
  else
    zogLog.err ('unable to install zog depedencies\n' + stderr);
}

zogLog.info ('install zog dependencies');
try
{
  exec ('npm install commander inquirer cli-color', stage2);
}
catch (err)
{
  zogLog.err (err);
}
