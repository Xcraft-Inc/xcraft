'use strict';

var zogConfig  = require ('../zogConfig.js') ();
var busClient  = require (zogConfig.busClient);


module.exports = function ()
{
  return {
    token    : busClient.getToken (),
    timestamp: new Date ().toISOString (),
    data     : {}
  };
};
