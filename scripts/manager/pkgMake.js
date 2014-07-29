'use strict';

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

  var postinstFileIn  = path.join (zogConfig.pkgTemplatesRoot, zogConfig.pkgPostinst);
  var postinstFileOut = path.join (packagePath, zogConfig.pkgWPKG, zogConfig.pkgPostinst);

  var placeHolders =
  {
    '__SHARE__'   : path.relative (packagePath, postInstDir),
    '__ACTION__'  : 'install',
    '__SYSROOT__' : './',
    '__CONFIG__'  : 'etc/peon.json'
  };

  /* FIXME: experimental, not tested. */
  var data = fs.readFileSync (postinstFileIn, 'utf8');
  Object.keys (placeHolders).forEach (function (it)
  {
    data = data.replace (it, placeHolders[it]);
  });

  fs.writeFileSync (postinstFileOut, data, 'utf8');
};

var createConfigJson = function (packageName, postInstDir)
{
  var fs  = require ('fs');
  var url = require ('url');
  var zogUri = require ('zogUri');

  var def = pkgControl.loadPackageDef (packageName);
  var config = def.data;

  config.uri = zogUri.realUri (config.uri, packageName);

  var data = JSON.stringify (config, null, 2);
  var outFile = path.join (postInstDir, 'config.json');
  fs.writeFileSync (outFile, data, 'utf8');
};

var processCtrlFile = function (packageName, callbackDone)
{
  var i = 0;
  var controlFiles = pkgControl.controlFiles (packageName, true);

  var wpkgEngine = require ('./wpkgEngine.js');

  var nextCtrlFile = function ()
  {
    var controlFile = controlFiles[i];

    zogLog.info ('process ' + controlFile);

    var packagePath = path.resolve (path.dirname (controlFile), '..');

    /* Reserved directory for the post-installer. */
    var namespace = '';
    var name = packageName;
    var fullName = packageName.match (/(.*)\+(.*)/);
    if (fullName)
    {
      namespace = fullName[1];
      name      = fullName[2];
    }

    var sharePath = path.join (packagePath, 'usr', 'share', namespace, name);
    zogFs.mkdir (sharePath);

    var build = function ()
    {
      var wpkgBuild = function (packageDef)
      {
        /* Don't copy pre/post scripts with unsupported architectures. */
        if (packageDef.architecture.indexOf ('all') === -1)
          copyTemplateFiles (packagePath, sharePath);

        createConfigJson (packageName, sharePath);

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

      var packageDef = pkgControl.loadPackageDef (packageName);

      /* Are the resources embedded in the package (less than 1GB)? */
      if (packageDef.data.embedded && packageDef.data.uri.length)
      {
        var zogPeon = require ('zogPeon');
        var zogUri  = require ('zogUri');

        var dataType  = packageDef.data.type;
        var rulesType = packageDef.data.rules.type;
        var uri       = packageDef.data.uri;
        zogPeon[dataType][rulesType] (zogUri.realUri (uri, packageName), packagePath, function (done)
        {
          if (done)
            wpkgBuild (packageDef);
          else
            zogLog.err ('can not build ' + packageName);
        });
      }
      else
        wpkgBuild (packageDef);
    };

    /* Look for premake script. */
    try
    {
      var productPath = path.join (zogConfig.pkgProductsRoot, packageName);
      var premake = require (path.join (productPath, 'premake.js')) (zogConfig, packagePath, sharePath);
      premake.copy (function (done)
      {
        if (done)
          build ();
      });
    }
    catch (err)
    {
      if (err.code === 'MODULE_NOT_FOUND')
      {
        zogLog.info ('no premake script for this package');
        build ();
      }
      else
        zogLog.err (err);
    }
  };

  if (controlFiles.length)
    nextCtrlFile ();
}

exports.package = function (packageName, callbackDone)
{
  try
  {
    processCtrlFile (packageName, callbackDone);
  }
  catch (err)
  {
    zogLog.err (err);
  }
};
