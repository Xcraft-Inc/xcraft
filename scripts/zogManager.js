
var moduleName = 'manager';

var path     = require ('path');
var inquirer = require ('inquirer');

var zogConfig = require ('./zogConfig.js')();
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

  /* The first question is the package's name, then we set the default value. */
  wizard.header[0].default = packageName;

  var promptForDependency = function ()
  {
    inquirer.prompt (wizard.dependency, function (answers)
    {
      packageDef.push (answers);

      if (answers.hasDependency)
        promptForDependency (wizard, packageDef);
      else
      {
        inquirer.prompt (wizard.data, function (answers)
        {
          packageDef.push (answers);

          zogLog.verb ('JSON output (inquirer):\n' + JSON.stringify (packageDef, null, '  '));
          pkgCreate.pkgTemplate (packageDef);
        });
      }
    });
  };

  inquirer.prompt (wizard.header, function (answers)
  {
    packageDef.push (answers);
    promptForDependency ();
  });
}

/**
 * Make the Control file for WPKG by using a package config file.
 * @param {string} packageName
 */
exports.make = function (packageName)
{
  zogLog.info ('make the wpkg package for ' + (packageName || 'all'));

  var pkgMake = require (zogConfig.libPkgMake);

  if (!packageName)
    packageName = 'all';

  if (packageName == 'all')
  {
    /* We use a grunt task for this job (with mtime check). */
    var grunt     = require ('grunt');
    var gruntFile = path.join (zogConfig.toolchainRoot, 'Gruntfile.js');
    var zogMake   = require (gruntFile)(grunt);

    grunt.tasks ([ 'newer' ]);
  }
  else
    pkgMake.package (packageName);
}
