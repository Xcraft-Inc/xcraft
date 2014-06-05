
var moduleName = 'manager';

var path     = require ('path');
var inquirer = require ('inquirer');
var zogLog   = require ('./lib/zogLog.js')(moduleName);

process.chdir (path.join (__dirname, '/..'));

var promptForDependency = function (wizard, package)
{
  inquirer.prompt (wizard.dependency, function (answers)
  {
    package.push (answers);

    if (answers.hasMoreDependency)
      promptForDependency (wizard, package);
    else
      zogLog.verb ('JSON output:\n' + JSON.stringify (package, null, '  '));
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
