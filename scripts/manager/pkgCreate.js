
var moduleName = 'manager';

var path      = require ('path');
var util      = require ('util');
var zogConfig = require ('../zogConfig.js') ();
var zogLog    = require ('zogLog') (moduleName);

/**
 * Convert an inquirer answer to a package definition.
 * @param {Object} inquirerPkg - The Inquirer answers.
 * @returns {Object} The zog package definition.
 */
var inquirerToPackage = function (inquirerPkg)
{
  var packageDef = {};

  inquirerPkg.forEach (function (it)
  {
    if (it.hasOwnProperty ('package'))
    {
      packageDef.name              = it.package;
      packageDef.version           = it.version;
      packageDef.maintainer        = {};
      packageDef.maintainer.name   = it.maintainerName;
      packageDef.maintainer.email  = it.maintainerEmail;
      packageDef.architecture      = it.architecture;
      packageDef.description       = {};
      packageDef.description.brief = it.descriptionBrief;
      packageDef.description.long  = it.descriptionLong;
      packageDef.dependency        = {};
    }
    else if (it.hasOwnProperty ('hasDependency') && it.hasDependency == true)
    {
      if (!util.isArray (packageDef.dependency[it.dependency]))
        packageDef.dependency[it.dependency] = [];
      packageDef.dependency[it.dependency].push (it.version);
    }
    else if (it.hasOwnProperty ('uri'))
    {
      packageDef.data              = {};
      packageDef.data.uri          = it.uri;
      packageDef.data.type         = it.fileType;
      packageDef.data.install      = {};
      packageDef.data.install.type = it.installType;
      packageDef.data.install.args = it.installArgs;
    }
  });

  return packageDef;
}

/**
 * Create a package template for the toolchain.
 * @param {Object} inquirerPkg - The Inquirer answers.
 */
exports.pkgTemplate = function (inquirerPkg)
{
  zogLog.info ('create the package definition for ' + inquirerPkg[0].package);

  var packageDef = inquirerToPackage (inquirerPkg);
  zogLog.verb ('JSON output (package):\n' + JSON.stringify (packageDef, null, '  '));

  var fs       = require ('fs');
  var inquirer = require ('inquirer');
  var wizard   = require (zogConfig.libPkgWizard).chest;

  var pkgDir = path.join (zogConfig.pkgProductsRoot, packageDef.name);

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
        fs.mkdirSync (pkgDir, 0755, function (err)
        {
          if (err)
            throw err;
        });
      }
      else
        throw err;
    }

    /* We look for chest:// and we propose to upload the file. */
    if (/^chest:\/\//.test (packageDef.data.uri))
    {
      var file = packageDef.data.uri.replace (/^chest:\/\//, '');

      inquirer.prompt (wizard, function (answers)
      {
        /* Async */
        if (answers.mustUpload)
        {
          zogLog.info ('upload %s to chest://%s:%d/%s',
                       answers.localPath,
                       zogConfig.chest.host,
                       zogConfig.chest.port,
                       file);

          var chestClient = require ('../chest/chestClient.js');
          chestClient.upload (answers.localPath);
        }
      });
    }

    var yaml = require ('js-yaml');

    var yamlPkg = yaml.safeDump (packageDef);
    fs.writeFileSync (path.join (pkgDir, zogConfig.pkgCfgFileName), yamlPkg, [], function (err)
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
