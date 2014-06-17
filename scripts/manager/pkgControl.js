
var moduleName = 'manager';

var path      = require ('path');
var util      = require ('util');
var zogConfig = require ('../zogConfig.js');
var zogLog    = require ('../lib/zogLog.js')(moduleName);

var loadPackageDef = function (packageName)
{
  var pkgConfig = path.join (zogConfig.pkgProductsRoot, packageName, zogConfig.pkgCfgFileName);

  var yaml = require ('js-yaml');
  var fs   = require ('fs');

  var data = fs.readFileSync(pkgConfig, 'utf8');

  var def = yaml.safeLoad (data);
  zogLog.verb ('JSON output (package):\n' + JSON.stringify (def, null, '  '));

  return def;
}

var defToControl = function (packageDef)
{
  var controlMap =
  {
    "name"        : "Package",
    "version"     : "Version",
    "architecture": "Architecture",
    "maintainer"  : "Maintainer",
    "description" : "Description",
    "dependency"  : "Depends"
  };

  var controlList = {};

  packageDef['architecture'].forEach (function (arch)
  {
    var control = '';

    Object.keys (packageDef).forEach (function (entry)
    {
      if (!controlMap.hasOwnProperty (entry))
        return;

      var fctValue = function (it)
      {
        var result = '';
        switch (it)
        {
        case 'architecture':
          result = arch;
          break;

        case 'maintainer':
          result = util.format ('"%s" <%s>',
                                packageDef[it].name,
                                packageDef[it].email);
          break;

        case 'description':
          result = util.format ('%s', packageDef[it].brief);
          if (packageDef[it].long.length > 0)
            result += util.format ('\n  %s', packageDef[it].long);
          break;

        case 'dependency':
          var cnt = 0;
          Object.keys (packageDef[it]).forEach (function (dep)
          {
            packageDef[it][dep].forEach (function (version)
            {
              result += util.format ('%s%s', cnt > 0 ? ', ' : '', dep);
              if (version.length > 0)
                result += util.format (' (%s)', version);
              cnt++;
            });
          });
          break;

        default:
          if (!packageDef.hasOwnProperty (it))
            return;

          result = packageDef[it];
          break;
        }

        return result.trim ();
      };

      var result = fctValue (entry);
      if (result.length > 0)
        control += util.format ('%s: %s\n', controlMap[entry], result);
    });

    controlList[arch] = control;

    zogLog.verb (util.format ('Control file (%s):\n%s', arch, control));
  });

  return controlList;
}

var saveControlFiles = function (packageName)
{
  zogLog.info ('save the control files for ' + packageName);

  var fs    = require ('fs');
  var zogFs = require ('../lib/zogFs.js');

  var def     = loadPackageDef (packageName);
  var control = defToControl (def);

  Object.keys (control).forEach (function (arch)
  {
    var controlDir  = path.join (zogConfig.pkgTempRoot, arch, packageName, 'WPKG');
    var controlFile = path.join (controlDir, 'control');

    if (fs.existsSync (controlFile))
      zogLog.warn ('the control file will be overwritten: ' + controlFile);

    zogFs.mkdir (controlDir);
    fs.writeFileSync (controlFile, control[arch]);
  });
}

exports.pkgMake = function (packageName)
{
  try
  {
    saveControlFiles (packageName);
  }
  catch (err)
  {
    zogLog.err (err);
  }
}
