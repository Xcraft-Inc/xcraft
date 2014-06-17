
var moduleName = 'manager';

var path      = require ('path');
var util      = require ('util');
var zogConfig = require ('../zogConfig.js');
var zogLog    = require ('../lib/zogLog.js')(moduleName);

var loadPackageDef = function (packageName)
{
  var pkgConfig = path.join (zogConfig.pkgProductsRoot, packageName, 'config.yaml');

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
    "architecture": "Architectures",
    "maintainer"  : "Maintainer",
    "description" : "Description",
    "dependency"  : "Depends"
  };

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
        packageDef[it].forEach (function (arch)
        {
          result += ' ' + arch;
        })
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

  zogLog.verb ('Control file:\n' + control);
  return control;
}

exports.pkgMake = function (packageName)
{
  try
  {
    var fs    = require ('fs');
    var zogFs = require ('../lib/zogFs.js');

    var def     = loadPackageDef (packageName);
    var control = defToControl (def);

    var controlDir  = path.join (zogConfig.pkgTempRoot, packageName);
    var controlFile = path.join (controlDir, 'control');

    zogFs.mkdir (controlDir);
    fs.writeFileSync (controlFile, control);
  }
  catch (err)
  {
    zogLog.err (err);
  }
}
