#!/usr/bin/env node

var sys  = require ('sys');
var exec = require ('child_process').exec;

try
{
  process.chdir (__dirname + '/..');
  console.log ('[stage1] go to the toolchain directory: ' + process.cwd ());
}
catch (err)
{
  console.log ('[stage1] ' + err);
}

function stage2(error, stdout, stderr)
{
  sys.puts (stdout)
  
  if (error === null)
  {
    console.log ('[stage1] end of stage one');
    exec ('zog -w install', function (error, stdout, stderr) {
      sys.puts (stdout)
    });
  }
}

console.log ('[stage1] install commander');
try
{
  exec ('npm install commander', stage2);
}
catch (err)
{
  console.log ('[stage1] ' + err);
}
