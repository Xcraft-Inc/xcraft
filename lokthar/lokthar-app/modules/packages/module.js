var module      = angular.module('packageManager', ['checklist-model']);

module.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise("/packages.manager");
  $stateProvider
    .state('packages.manager', {
      url: "/packages/manager",
      templateUrl: 'modules/packages/views/manager.html',
    controller: 'PackageManagerController'
    })
    .state('packages.editor', {
      url: "/packages/editor",
      templateUrl: 'modules/packages/views/editor.html',
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
  var wizard                  = require (zogConfig.pkgWizard);
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

//Validator directive, call action in attr, and set
//validity for the form field.
module.directive('validator', [function () {
    return {
        restrict: 'A',
        scope: {
          action: '&validator',
          model:  '=ngModel',
        },
        require: 'ngModel',
        link: function (scope, elem, attrs, control) {
              scope.$watch('model', function (data) {
                if(scope.model!==undefined)
                {
                  var action = scope.action();
                  if(action !== undefined)
                  {
                    control.$setValidity("valid", action(scope.model));
                  }
                }
              });
        }
    };
}]);
