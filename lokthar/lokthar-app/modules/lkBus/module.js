'use strict';
// LoKthar Bus Module
//
var mod           = angular.module('lk-bus', []);
var remote        = require('remote');
var path          = require('path');
var zogConfig     = remote.require (path.resolve('./scripts/zogConfig.js'))();
var busClient     = remote.require (zogConfig.busClient);

mod.factory ('busClient', function () {
  return busClient;
});
