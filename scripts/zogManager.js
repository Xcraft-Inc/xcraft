
var moduleName = 'manager';

var path     = require ('path');
var inquirer = require ('inquirer');

var zogLog    = require ('./lib/zogLog.js')(moduleName);
var pkgCreate = require ('./manager/pkgCreate.js');

process.chdir (path.join (__dirname, '/..'));

exports.create = function (packageName)
{
  zogLog.info ('create a new package: ' + packageName);

  var wizard = require ('./manager/pkgWizard.js');
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

exports.make = function (packageName)
{
  zogLog.info ('make the wpkg package for ' + (packageName || 'all'));

  var pkgControl = require ('./manager/pkgControl.js');

  pkgControl.pkgMake (packageName);
}
