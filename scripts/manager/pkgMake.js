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
};

var createConfigJson = function (packageName, postInstDir)
{
  var fs  = require ('fs');
  var url = require ('url');

  var def = pkgControl.loadPackageDef (packageName);
  var config = def.data;

  var uri = '';

  var uriObj = url.parse (config.uri)
  if (uriObj.protocol == 'chest:')
  {
    var util = require ('util');

    var protocol = 'http';
    if (zogConfig.chest.port == 443)
      protocol = 'https';

    var server = util.format ('%s://%s:%d/resources/',
                              protocol,
                              zogConfig.chest.host,
                              zogConfig.chest.port);

    config.uri = config.uri.replace ('chest://', server);
  }

  var data = JSON.stringify (config, null, 2);
  var outFile = path.join (postInstDir, 'config.json');
  fs.writeFileSync (outFile, data, 'utf8');
};

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
      var namespace   = packageName.replace (/\+.*$/, '');
      var name        = packageName.replace (/^[^+]*\+/, '');
      var sharePath   = path.join (packagePath, 'usr', 'share', namespace, name);
      zogFs.mkdir (sharePath);


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

    if (controlFiles.length)
      nextCtrlFile ();
  }
  catch (err)
  {
    zogLog.err (err);
  }
};
