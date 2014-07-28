///LoKthar Packages
//
var module      = angular.module('lk-packages', ['checklist-model','lk-helpers']);

module.config(function($stateProvider, $urlRouterProvider) {
  var module_root = 'modules/lkPackages/';
  $urlRouterProvider.otherwise("/packages.manager");
  $stateProvider
    .state('packages', {
      templateUrl: module_root + 'views/packages.html',
      controller: 'PackagesController'
    })
    .state('packages.manager', {
      url: "/packages/manager",
      templateUrl:  module_root + 'views/manager.html',
      controller: 'PackageManagerController'
    })
    .state('packages.editor', {
      url: "/packages/editor",
      templateUrl: module_root + 'views/editor.html',
      controller: 'PackageEditorController'
    })
});

module.controller('PackagesController', ['$scope', function ($scope){
  $scope.title = 'Packages';
  $scope.badge = 'beta';
  $scope.icon = 'puzzle-piece';
}]);

module.controller('PackageManagerController', ['$scope', function ($scope){

  $scope.listProducts = function () {
    var ipc         = require('ipc');
    $scope.products = ipc.sendSync('list-product-packages');
  };

}]);

module.controller('PackageEditorController', ['$scope','$state',
function ($scope, $state) {
  //Contains packages definitions fields for header and deps
  var wizard                  = require (zogConfig.libPkgWizard);
  //final template for package creation
  var packageTemplate         = [];

  //header related fields and initial model
  $scope.headerFields         = wizard.header;
  $scope.header               = {};
  $scope.header.architecture  = [];

  //dependencies related fields and initial model
  $scope.dependencyFields     = wizard.dependency;
  $scope.dependency           = {};
  $scope.dependencies         = {};

  $scope.createPackage = function ()
  {
    //add header to package template
    packageTemplate.push($scope.header);
    //add dependencies to package template
    for(var d in $scope.dependencies)
    {
      packageTemplate.push($scope.dependencies[d]);
    }
    //send template to browser side, for package creation
    var ipc = require('ipc');
    ipc.send('create-package', packageTemplate);
    $state.go('packages.manager');
  };

  $scope.addDependency = function ()
  {
    //prepare dependencies hash from model
    var key = $scope.dependency.package;
    $scope.dependencies[key] = {};
    $scope.dependencies[key].hasDependency  = true;
    $scope.dependencies[key].dependency     = $scope.dependency.package;
    $scope.dependencies[key].version        = $scope.dependency.version;

    //clear dependency model for the next dependency
    $scope.dependency        = {};
  };

}]);
