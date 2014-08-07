'use strict';

var moduleName = 'bus-message';

var zogConfig  = require ('../zogConfig.js') ();
var zogLog     = require ('zogLog') (moduleName);
var busClient  = require (zogConfig.busClient);


module.exports = function ()
{
  return {
    token    : busClient.getToken (),
    timestamp: new Date ().toISOString (),
    data     : {}
  };
};
