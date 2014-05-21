#!/usr/bin/env node

var program = require ('commander');

function wpkgManager ()
{
  this.install = function (action)
  {
    console.log ('[stage2] [wpkg] ' + action);
  }
}

var wpkg = new wpkgManager;

program
  .version ('0.0.1')
  .option ('-w, --wpkg [action]', 'Manage the wpkg installation', wpkg.install)
  .parse (process.argv);
