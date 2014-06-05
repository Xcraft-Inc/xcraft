
var inquirer = require ('inquirer');

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
  console.log ('[zog:create] package wizard');

  var wizard = require ('./lib/pkgWizard.js');

  var package = [];
  package.package = packageName;

  inquirer.prompt (wizard.header, function (answers)
  {
    package.push (answers);
    promptForDependency (wizard, package);
  });
}
