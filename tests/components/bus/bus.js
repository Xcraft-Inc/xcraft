'use strict';

var moduleName = 'test';

var zogLog     = require ('zogLog') (moduleName);
var zogConfig  = require ('../../../scripts/zogConfig.js') ();
var zogBoot    = require ('../../../scripts/zogBoot.js');

var busCommander = require ('../../../scripts/bus/busCommander.js');
var busClient    = require (zogConfig.busClient);

var mainShutdown = function () {
  busClient.stop (function (done) { /* jshint ignore:line */
    zogBoot.stop ();
  });
};


before (function (done) {
  zogBoot.start (function (startDone) { /* jshint ignore:line */
    busCommander.registerCommandHandler ('test.bus.events.serialize', function (msg) { /* jshint ignore:line */
      var data = {
        testFunction : function () {
          return 'success';
        }
      };

      busClient.events.send ('test.serialize.data.sended', data, true);
    });

    done ();
  });
});


describe ('object serialization on messages', function () {
  it ('testFunction() should return \'success\'', function (done) {
    busClient.events.subscribe ('test.serialize.data.sended', function (msg) {
      msg.data.testFunction().should.equal ('success');
      done ();
    });

    busClient.command.send ('test.bus.events.serialize', null, mainShutdown);
  });
});

zogLog.verbosity (2);
