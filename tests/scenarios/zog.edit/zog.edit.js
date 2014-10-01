'use strict';

var moduleName = 'test';

var path = require ('path');
var fs   = require ('fs');

var zogLog    = require ('xcraft-core-log') (moduleName);
var zogConfig = require ('../../../scripts/zogConfig.js') ();
var zogBoot   = require ('../../../scripts/zogBoot.js');

var busClient = require ('xcraft-core-busclient');
var pkgWizard = require (zogConfig.libPkgWizard);


var mainShutdown = function () {
  busClient.stop (function (done) { /* jshint ignore:line */
    zogBoot.stop ();
  });
};

var registerSubTest = function (category, msg, packageData) {
  msg.data.forEach (function (fieldDef) {
    if (!packageData.hasOwnProperty (fieldDef.name + '.validate')) {
      return;
    }

    var list = pkgWizard[category].filter (function (def) {
      return def.name === fieldDef.name;
    });

    if (!list.length) {
      zogLog.warn ('can not find the property ' + fieldDef.name);
      return;
    }

    var text = 'test [' + packageData['mocha.id'] + '] -> testing property \'' +
               fieldDef.name +
               '\' (' + packageData[fieldDef.name] + ')';

    describe (text, function () {
      it (packageData['mocha.it'], function (done) {
        var valid = packageData[fieldDef.name + '.validate'];
        list[0].validate (packageData[fieldDef.name]).should.be[valid]; /* jshint ignore:line */
        done ();
      });
    });
  });
};

var registerTest = function (listData, category) {
  var i = 0;

  listData.forEach (function (packageData) {
    packageData['mocha.id'] = i++;

    var text = 'send command \'zogManager.edit.' +
               category +
               '\', test [' + packageData['mocha.id'] + ']';

    describe (text, function () {
      var msg = {
        packageName: 'test-package',
        isPassive  : true,
        packageDef : packageData
      };

      it ('zogManager.edit.header.added should be called', function (done) {
        busClient.events.subscribe ('zogManager.edit.' + category + '.added', function (msg) {
          registerSubTest ('header', msg, packageData);
          done ();
        });

        busClient.command.send ('zogManager.edit.' + category, msg, mainShutdown);
      });
    });
  });
};

var listData = JSON.parse (fs.readFileSync (path.join (__dirname, './data.json'), 'utf8'));

registerTest (listData, 'header');

before (function (done) {
  zogBoot.start (function (startDone) { /* jshint ignore:line */
    done ();
  });
});

zogLog.verbosity (2);
