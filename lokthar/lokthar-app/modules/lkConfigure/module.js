///LoKthar Configure
//

var module      = angular.module('lk-configure', ['checklist-model','lk-helpers']);
//Link relative zogConfig lib
var zogConfig   = require ('../../scripts/zogConfig.js')();

module.config(function($stateProvider, $urlRouterProvider) {
  var module_root = 'modules/lkConfigure/';

  $urlRouterProvider.otherwise("/configure");
  $stateProvider
    .state('configure', {
      url: "/configure",
      templateUrl: module_root + 'views/config.html',
      controller: 'ConfigurationController'
    })
});

module.controller('ConfigurationController', ['$scope', function ($scope){
  $scope.title  = 'Configuration';
  $scope.badge  = 'dev';
  $scope.icon   = 'cog';

  $scope.libRoot          = zogConfig.libRoot;
  $scope.productsRoot     = zogConfig.pkgProductsRoot;
  $scope.nodeModulesRoot  = zogConfig.nodeModulesRoot;

  $scope.openFolder = function (path)
  {
    var shell = require('shell');
    shell.openItem(path);
  };
}]);
