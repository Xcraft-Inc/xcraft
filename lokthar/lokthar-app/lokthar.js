var app = angular.module('lokthar', ['ngRoute']);

app.config(['$routeProvider',
	function($routeProvider) {
		$routeProvider
		.when('/home', {
			templateUrl: 'partials/home.html',
			controller: 'HomeController'
		})
		.when('/packages', {
			templateUrl: 'partials/packages.html',
			controller: 'PackagesController'
		})
		.when('/config', {
			templateUrl: 'partials/config.html',
			controller: 'ConfigController'
		})
		.when('/profile', {
			templateUrl: 'partials/profile.html',
			controller: 'ProfileController'
		})
		.when('/about', {
			templateUrl: 'partials/about.html',
			controller: 'AboutController'
		})
		.otherwise({
			redirectTo: '/home'
		});
}]);


app.controller('PackagesController', ['$scope', '$routeParams', function ($scope, $routeParams){

}]);

app.controller('ConfigController', ['$scope', '$routeParams', function ($scope, $routeParams){

}]);

app.controller('ProfileController', ['$scope', '$routeParams', function ($scope, $routeParams){

}]);

app.controller('HomeController', ['$scope', '$routeParams', function ($scope, $routeParams){
	$scope.openConsole = function ()
	{
		var ipc = require('ipc');
		ipc.send('open-console', '');
	}

	$scope.quit = function ()
	{
		var ipc = require('ipc');
		ipc.send('close-app', '');
	}

	$scope.openSysroot = function ()
	{
		var shell = require('shell');
		shell.openItem(__dirname +"../../../");
	}
}]);

app.controller('AboutController', ['$scope', '$routeParams', function ($scope, $routeParams){

}]);