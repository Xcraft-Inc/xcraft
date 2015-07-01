'use strict';
// LoKthar Bus Module
//
var mod           = angular.module('lk-bus', []);
var remote        = require('remote');
var busClient     = remote.require ('xcraft-core-busclient').getGlobal ();

mod.factory ('busClient', function () {
  return busClient;
});
