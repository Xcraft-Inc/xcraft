///LoKthar Bus Module
//
var module        = angular.module('lk-bus', []);
var remote        = require('remote');
var path          = require('path');
var zogConfig     = remote.require (path.resolve('./scripts/zogConfig.js'))();
var busClient     = remote.require (zogConfig.busClient);

module.factory ('busClient', function(){
    return busClient;
});
