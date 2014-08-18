'use strict';

var moduleName = 'test';

var should = require ('should');
var path   = require ('path');
var fs     = require ('fs');

var zogLog     = require ('zogLog') (moduleName);
var zogManager = require ('../../../scripts/zogManager.js');
var zogConfig  = require ('../../../scripts/zogConfig.js') ();
var zogBoot    = require ('../../../scripts/zogBoot.js');

var busClient = require (zogConfig.busClient);
var pkgWizard = require (zogConfig.libPkgWizard);


var mainShutdown = function ()
{
  busClient.stop (function (done)
  {
    zogBoot.stop ();
  });
};

var registerSubTest = function (category, msg, packageData)
{
  msg.data.forEach (function (fieldDef)
  {
    if (!packageData.hasOwnProperty (fieldDef.name + '.validate'))
      return;

    var list = pkgWizard[category].filter (function (def)
    {
      return def.name === fieldDef.name;
    });

    if (!list.length)
    {
      zogLog.warn ('can not find the property ' + fieldDef.name);
      return;
    }

    describe ('test [' + packageData['mocha.id'] + '] -> testing property \'' + fieldDef.name + '\'', function ()
    {
      it (packageData['mocha.it'], function (done)
      {
        list[0].validate (packageData[fieldDef.name]).should.be[packageData[fieldDef.name + '.validate']];
        done ();
      });
    });
  });
};

var registerTest = function (listData, category)
{
  listData.forEach (function (packageData)
  {
    packageData['mocha.id'] = i++;

    describe ('send command \'zogManager.edit.' + category + '\', test [' + packageData['mocha.id'] + ']', function ()
    {
      var msg =
      {
        packageName: 'test-package',
        isPassive  : true,
        packageDef : packageData
      };

      it ('zogManager.edit.header.added should be called', function (done)
      {
        busClient.events.subscribe ('zogManager.edit.' + category + '.added', function (msg)
        {
          registerSubTest ('header', msg, packageData);
          done ();
        });

        busClient.command.send ('zogManager.edit.' + category, msg, mainShutdown);
      });
    });
  });
};

var i = 0;
var listData = JSON.parse (fs.readFileSync (path.join (__dirname, './data.json'), 'utf8'));

registerTest (listData, 'header');

before (function (done)
{
  zogBoot.start (function (startDone)
  {
    done ();
  });
});

zogLog.verbosity (2);
