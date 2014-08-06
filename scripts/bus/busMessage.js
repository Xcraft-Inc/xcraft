'use strict';


var moduleName = 'bus-message';
var zogConfig  = require ('../zogConfig.js') ();
var zogLog     = require ('zogLog') (moduleName);
var busBoot    = require (zogConfig.busBoot);

module.exports = function ()
{
  return {
    token     : busBoot.getToken (),
    timestamp : new Date ().toISOString (),
    data      : {}
  };
};
