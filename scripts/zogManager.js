
var moduleName = 'manager';

var path     = require ('path');
var inquirer = require ('inquirer');

var zogConfig = require ('./zogConfig.js');
var zogLog    = require ('./lib/zogLog.js')(moduleName);
var pkgCreate = require (zogConfig.libPkgCreate);

process.chdir (path.join (__dirname, '/..'));

/**
 * Create a new package template or modify an existing package config file.
 * @param {string} packageName
 */
exports.create = function (packageName)
{
  zogLog.info ('create a new package: ' + packageName);

  var wizard = require (zogConfig.libPkgWizard);
  var package = [];

  var promptForDependency = function (wizard, package)
  {
    inquirer.prompt (wizard.dependency, function (answers)
    {
      package.push (answers);

      if (answers.hasDependency)
        promptForDependency (wizard, package);
      else
      {
        zogLog.verb ('JSON output (inquirer):\n' + JSON.stringify (package, null, '  '));
        pkgCreate.pkgTemplate (package);
      }
    });
  }

  inquirer.prompt (wizard.header, function (answers)
  {
    answers.package = packageName;
    package.push (answers);
    promptForDependency (wizard, package);
  });
}

/**
 * Make the Control file for WPKG by using a package config file.
 * @param {string} packageName
 */
exports.make = function (packageName)
{
  zogLog.info ('make the wpkg package for ' + (packageName || 'all'));

  var pkgControl = require (zogConfig.libPkgControl);

  if (packageName && packageName != 'all')
    pkgControl.pkgMake (packageName);
  else if (packageName == 'all')
  {
    var zogFs = require ('./lib/zogFs.js');
    var packagesDir = zogFs.lsdir (zogConfig.pkgProductsRoot);

    packagesDir.forEach (function (packageName)
    {
      pkgControl.pkgMake (packageName);
    });
  }
}
