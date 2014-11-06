'use strict';

var moduleName = 'test';

var path = require ('path');
var fs   = require ('fs');

var zogConfig = require ('../../../scripts/zogConfig.js') ();
var zogBoot   = require ('../../../scripts/zogBoot.js');

var xLog      = require ('xcraft-core-log') (moduleName);
var busClient = require ('xcraft-core-busclient');

var pkgWizard = require (zogConfig.libPkgWizard);
pkgWizard.initConfig (zogConfig);

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
      xLog.warn ('can not find the property ' + fieldDef.name);
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

    var text = 'send command \'pacman.edit.' +
               category +
               '\', test [' + packageData['mocha.id'] + ']';

    describe (text, function () {
      var msg = {
        packageName: 'test-package',
        isPassive  : true,
        packageDef : packageData
      };

      it ('pacman.edit.header.added should be called', function (done) {
        busClient.events.subscribe ('pacman.edit.' + category + '.added', function (msg) {
          registerSubTest ('header', msg, packageData);
          done ();
        });

        busClient.command.send ('pacman.edit.' + category, msg, mainShutdown);
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

xLog.verbosity (2);
