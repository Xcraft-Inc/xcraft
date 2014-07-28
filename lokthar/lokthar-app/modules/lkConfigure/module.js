///LoKthar Configure
///

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
    .state('configure.chest', {
      url: "/configure/chest",
      templateUrl:  module_root + 'views/chest.html',
      controller: 'ChestController'
    })
    .state('configure.directories', {
      url: "/configure/directories",
      templateUrl: module_root + 'views/directories.html',
      controller: 'DirectoriesController'
    })
});

module.controller('ConfigurationController', ['$scope', function ($scope){
  $scope.title  = 'Configuration';
  $scope.badge  = 'dev';
  $scope.icon   = 'cog';
}]);

module.controller('DirectoriesController', ['$scope', function ($scope){
  //Display some directories, with opening feature
  $scope.libRoot          = zogConfig.libRoot;
  $scope.productsRoot     = zogConfig.pkgProductsRoot;
  $scope.nodeModulesRoot  = zogConfig.nodeModulesRoot;

  $scope.openFolder = function (path)
  {
    var shell = require('shell');
    shell.openItem(path);
  };
}]);

module.controller('ChestController', ['$scope', function ($scope){
  //Some wiz' for chest
  var wizard              = require (zogConfig.confWizard);
  $scope.chestFields      = wizard.chest;
  $scope.chest            = {};

}]);
