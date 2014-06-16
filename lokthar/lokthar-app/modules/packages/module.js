var module      = angular.module('packageManager', ['checklist-model', 'selectlist-model']);

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
  var wizard                  = require (zogConfig.pkgWizard);
  $scope.headerFields         = wizard.header;
  $scope.dependencyFields     = wizard.dependency;
  $scope.dependencyModel      = {};

  $scope.packageTemplate      = [];

  $scope.package              = {};
  $scope.package.architecture = [];
  $scope.dependencies   = [];

  $scope.createPackage = function ()
  {
    $scope.packageTemplate.push($scope.package);
    for(var d in $scope.dependencies)
    {
      $scope.packageTemplate.push($scope.dependencies[d]);
    }

    var ipc = require('ipc');
    ipc.send('create-package', $scope.packageTemplate);
  };

  $scope.addDependency = function ()
  {  
    var key = $scope.dependencyModel.package; 
    $scope.dependencies[key] = {};
    $scope.dependencies[key].hasDependency  = true;
    $scope.dependencies[key].dependency     = $scope.dependencyModel.package;
    $scope.dependencies[key].version        = $scope.dependencyModel.version;
    
    $scope.dependencyModel      = {};
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