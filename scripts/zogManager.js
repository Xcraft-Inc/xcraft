
var moduleName = 'manager';

var path     = require ('path');
var util     = require ('util');
var inquirer = require ('inquirer');
var zogLog   = require ('./lib/zogLog.js')(moduleName);

process.chdir (path.join (__dirname, '/..'));

/**
 * \brief Convert an inquirer answer to a package definition.
 */
var inquirerToPackage = function (inquirerPkg)
{
  var package = {};

  inquirerPkg.forEach (function (it)
  {
    if (it.hasOwnProperty ('package'))
    {
      package.name              = it.package;
      package.version           = it.version;
      package.maintainer        = {};
      package.maintainer.name   = it.maintainerName;
      package.maintainer.email  = it.maintainerEmail;
      package.architecture      = it.architecture;
      package.description       = {};
      package.description.brief = it.descriptionBrief;
      package.description.long  = it.descriptionLong;
      package.dependency        = {};
    }
    else if (it.hasOwnProperty ('hasDependency') && it.hasDependency == true)
    {
      if (!util.isArray (package.dependency[it.dependency]))
        package.dependency[it.dependency] = [];
      package.dependency[it.dependency].push (it.version);
    }
  });

  return package;
}

var createPackageTemplate = function (inquirerPkg)
{
  var package = inquirerToPackage (inquirerPkg);
  zogLog.verb ('JSON output (package):\n' + JSON.stringify (package, null, '  '));
}

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
      createPackageTemplate (package);
    }
  });
}

exports.create = function (packageName)
{
  zogLog.info ('create a new package: ' + packageName);

  var wizard = require ('./manager/pkgWizard.js');

  var package = [];

  inquirer.prompt (wizard.header, function (answers)
  {
    answers.package = packageName;
    package.push (answers);
    promptForDependency (wizard, package);
  });
}
