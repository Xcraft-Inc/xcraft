
var moduleName = 'manager';

var inquirer = require ('inquirer');
var zogLog   = require ('./lib/zogLog.js')(moduleName);

var promptForDependency = function (wizard, package)
{
  inquirer.prompt (wizard.dependency, function (answers)
  {
    package.push (answers);

    if (answers.hasMoreDependency)
      promptForDependency (wizard, package);
    else
      console.log (package);
  });
}

exports.create = function (packageName)
{
  zogLog.info ('create a new package: ' + packageName);

  var wizard = require ('./lib/pkgWizard.js');

  var package = [];
  package.package = packageName;

  inquirer.prompt (wizard.header, function (answers)
  {
    package.push (answers);
    promptForDependency (wizard, package);
  });
}
