
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
    // We use a grunt task for this job (with mtime check).
    var spawn = require ('child_process').spawn;
    var grunt = spawn ('node', [ zogConfig.binGrunt ]);

    grunt.stdout.on ('data', function (data)
    {
      zogLog.info ('grunt task:\n' + data);
    });

    grunt.stderr.on ('data', function (data)
    {
      zogLog.err ('grunt task:\n' + data);
    });

    grunt.on ('error', function (data)
    {
      zogLog.err (data);
    });

    grunt.on ('close', function (code)
    {
      zogLog.info ('grunt task terminated');
    });
  }
  else
    pkgControl.pkgMake (packageName);
}
