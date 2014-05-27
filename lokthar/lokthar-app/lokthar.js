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

}]);