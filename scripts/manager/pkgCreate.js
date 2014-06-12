
var moduleName = 'manager';

var path      = require ('path');
var util      = require ('util');
var zogConfig = require ('../zogConfig.js');
var zogLog    = require ('../lib/zogLog.js')(moduleName);

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

/**
 * \brief Create a package template for the toolchain.
 *
 * The definition file is named config.yaml. 
 */
exports.pkgTemplate = function (inquirerPkg)
{
  zogLog.info ('create the package definition for ' + inquirerPkg[0].package);

  var package = inquirerToPackage (inquirerPkg);
  zogLog.verb ('JSON output (package):\n' + JSON.stringify (package, null, '  '));

  var fs = require ('fs');

  var pkgDir = path.join (zogConfig.pkgProductsRoot, package.name);

  try
  {
    try
    {
      var st = fs.statSync (pkgDir);

      if (!st.isDirectory ())
      {
        var err = new Error (pkgDir + ' exists and it is not a directory');
        throw err;
      }
    }
    catch (err)
    {
      if (err.code == 'ENOENT')
      {
        fs.mkdirSync (pkgDir, 0777, function (err)
        {
          if (err)
            throw err;
        });
      }
      else
        throw err;
    }

    var yaml = require ('js-yaml');

    var yamlPkg = yaml.safeDump (package);
    fs.writeFileSync (path.join (pkgDir, 'config.yaml'), yamlPkg, [], function (err)
    {
      if (err)
        throw err;
    });
  }
  catch (err)
  {
    zogLog.err (err);
  }
}
