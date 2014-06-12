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
  var wizard            = require (zogConfig.pkgWizard);
  $scope.headerFields   = wizard.header;
  $scope.package        = [];
  $scope.package.architecture = [];

  $scope.buildPackage = function ()
  {
    $scope.json = $scope.package.architecture;
  }

  $scope.checkAllArch = function() {
    $scope.package.architecture = angular.copy($scope.package.architecture);
  };
  $scope.uncheckAllArch = function() {
    $scope.package.architecture = [];
  };
  $scope.checkDefaultArch = function(value) {
    $scope.package.architecture.push(value);
  };

}]);

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
                var action = scope.action();
                if(action !== undefined)
                {
                  control.$setValidity("valid", action(scope.model));
                }
              });                       
        }
    };
}]);