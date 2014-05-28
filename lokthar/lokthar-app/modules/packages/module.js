var module = angular.module('packageManager', []);

app.config(function($stateProvider, $urlRouterProvider) {
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

}]);