
var moduleName = 'manager';

var path       = require ('path');
var zogConfig  = require ('../zogConfig.js') ();
var zogFs      = require ('zogFs');
var zogLog     = require ('zogLog') (moduleName);
var pkgControl = require ('./pkgControl.js');

var copyTemplateFiles = function (packagePath, postInstDir)
{
  var fs          = require ('fs');
  var zogPlatform = require ('zogPlatform');

  var installerFileIn  = path.join (zogConfig.pkgTemplatesRoot, zogConfig.pkgInstaller);
  var installerFileOut = path.join (postInstDir, zogConfig.pkgInstaller);

  zogFs.cp (installerFileIn, installerFileOut);

  var postinstFileIn  = path.join (zogConfig.pkgTemplatesRoot, zogConfig.pkgPostinst);
  var postinstFileOut = path.join (packagePath, 'wpkg', zogConfig.pkgPostinst);

  var placeHolders =
  {
    '__INSTALLERJS__' : zogConfig.pkgInstaller,
    '__ACTION__'      : 'install',
    '__SYSROOT__'     : './',
    '__PRODUCTSHARE__': path.relative (packagePath, postInstDir)
  };

  /* FIXME: experimental, not tested. */
  var data = fs.readFileSync (postinstFileIn, 'utf8');
  Object.keys (placeHolders).forEach (function (it)
  {
    data = data.replace (it, placeHolders[it]);
  });

  fs.writeFileSync (postinstFileOut, data, 'utf8');
}

var createConfigJson = function (packageName, postInstDir)
{
  var fs  = require ('fs');
  var url = require ('url');

  var def = pkgControl.loadPackageDef (packageName);
  var config = {};

  var uri = '';

  var uriObj = url.parse (def.data.uri)
  if (uriObj.protocol == 'chest:')
  {
    var util = require ('util');

    var protocol = 'http';
    if (zogConfig.chest.port == 443)
      protocol = 'https';

    var server = util.format ('%s://%s:%d/',
                              protocol,
                              zogConfig.chest.host,
                              zogConfig.chest.port);

    uri = def.data.uri.replace ('chest://', server);
  }
  else
    uri = def.data.uri

  config.uri = uri;

  var data = JSON.stringify (config, null, 2);
  var outFile = path.join (postInstDir, 'config.json');
  fs.writeFileSync (outFile, data, 'utf8');
}

var copyZogModules = function (postInstDir)
{
  var wrench = require ('wrench');

  var zogModules = zogFs.lsdir (zogConfig.nodeModulesRoot, /^zog/);

  zogModules.forEach (function (mod)
  {
    var inDir  = path.join (zogConfig.nodeModulesRoot, mod);
    var outDir = path.join (postInstDir, 'node_modules', mod);

    zogLog.verb (inDir + ' -> ' + outDir);
    zogFs.mkdir (outDir);
    wrench.copyDirSyncRecursive (inDir, outDir,
    {
      forceDelete: true
    });
  });
}

exports.package = function (packageName, callbackDone)
{
  try
  {
    var i = 0;
    var controlFiles = pkgControl.controlFiles (packageName, true);

    var wpkgEngine = require ('./wpkgEngine.js');

    var nextCtrlFile = function ()
    {
      var controlFile = controlFiles[i];
      var packagePath = path.resolve (path.dirname (controlFile), '..');

      /* Reserved directory for the post-installer. */
      var postInstDir = path.join (packagePath, 'usr', 'share', packageName);
      zogFs.mkdir (postInstDir);

      /* TODO: the templates should be copy only when it is necessary; like when
       * a web-package and (or) an installer (msi-like) is used for example.
       */
      copyTemplateFiles (packagePath, postInstDir);

      createConfigJson (packageName, postInstDir);
      copyZogModules (postInstDir);

      /* Build the package with wpkg. */
      wpkgEngine.build (packagePath, function (error)
      {
        /* When we reach the last item, then we have done all async work. */
        if (i == controlFiles.length - 1)
        {
          if (callbackDone)
            callbackDone (true);
        }
        else
        {
          i++;
          nextCtrlFile ();
        }
      });
    };

    nextCtrlFile ();
  }
  catch (err)
  {
    zogLog.err (err);
  }
}
