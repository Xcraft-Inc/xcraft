var module      = angular.module('packageManager', []);

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

}]);

module.controller('PackageEditorController', ['$scope', function ($scope){
  var zogConfig       = require ('../../scripts/zogConfig.js');
  var wizard          = require (zogConfig.pkgWizard);

  $scope.headerFields   = wizard.header;
  $scope.package  = [];

}]);

module.directive('validator', [function () {
    return {
        restrict: 'A',
        scope: {
          action: '&validator',
        },
        require: 'ngModel',  
        link: function (scope, elem, attrs, control) {
              var result = scope.action(scope.$eval(attrs.ngModel)); 
              scope.$watch(result, function (n) {
                control.$setValidity("unique", n);
              });                               
        }
    };
}]);