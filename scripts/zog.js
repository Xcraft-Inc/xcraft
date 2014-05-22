#!/usr/bin/env node

function wpkgManager (pkg)
{
  var package = pkg;
  var pkgDir = '../packages/base/';
  var pkgConfig = require (pkgDir + package + '/config.json');

  /**
   * \brief Get the package from an URL.
   */
  this.get = function ()
  {
	var zogPlatform = require ('./lib/zogPlatform');
    var inputFile = pkgConfig.bin[zogPlatform.getOs ()];
    var outputFile = pkgConfig.out;
    
	var zogHttp = require ('./lib/zogHttp.js');
    zogHttp.get (inputFile, outputFile);
  }
  
  /**
   * \brief Install the package in /tools.
   */
  this.install = function ()
  {
    
  }
  
  /**
   * \brief Uninstall the package from /tools.
   */
  this.uninstall = function ()
  {
  
  }
  
  /**
   * \brief Actions called from commander with --wpkg.
   */
  this.action = function (act)
  {
    console.log ('[stage2] [' + package + '] ' + act);
  
  try
  {
     var wpkg = new wpkgManager (package);
     wpkg[act] ();
  }
  catch (err)
  {
    console.log ('[stage2] [' + package + ']: ' + err);
  }
  }
}

var wpkg = new wpkgManager ('wpkg');
var program = require ('commander');

process.chdir (__dirname + '/..');
program
  .version ('0.0.1')
  .option ('-w, --wpkg [action]', 'Manage the wpkg installation', wpkg.action)
  .parse (process.argv);
