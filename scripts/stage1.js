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

function puts(error, stdout, stderr)
{
  sys.puts (stdout)
}

console.log ('[stage1] install commander');
try
{
  exec ('npm install commander', puts);
  console.log ('[stage1] end of stage one');
}
catch (err)
{
  console.log ('[stage1] ' + err);
}
