
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
  var packageDef = [];

  var promptForDependency = function (wizard, packageDef)
  {
    inquirer.prompt (wizard.dependency, function (answers)
    {
      packageDef.push (answers);

      if (answers.hasDependency)
        promptForDependency (wizard, packageDef);
      else
      {
        zogLog.verb ('JSON output (inquirer):\n' + JSON.stringify (packageDef, null, '  '));
        pkgCreate.pkgTemplate (packageDef);
      }
    });
  }

  inquirer.prompt (wizard.header, function (answers)
  {
    answers.package = packageName;
    packageDef.push (answers);
    promptForDependency (wizard, packageDef);
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

  if (!packageName)
    packageName = 'all';

  if (packageName == 'all')
  {
    var zogFs = require ('./lib/zogFs.js');
    var packagesDir = zogFs.lsdir (zogConfig.pkgProductsRoot);

    packagesDir.forEach (function (packageName)
    {
      pkgControl.pkgMake (packageName);
    });
  }
  else
    pkgControl.pkgMake (packageName);
}
