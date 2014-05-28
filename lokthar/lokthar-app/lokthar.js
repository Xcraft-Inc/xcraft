var app = angular.module('lokthar', ['ui.router','packageManager']);

app.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise("/home");
  $stateProvider
    .state('home', {
      url: "/home",
      templateUrl: 'partials/home.html',
	  controller: 'HomeController' 
    })
    .state('packages', {
      templateUrl: 'partials/packages.html',
	  controller: 'PackagesController'
    })
    .state('config', {
      url: "/config",
        templateUrl: 'partials/config.html',
		controller: 'ConfigController'
    })
    .state('profile', {
      url: "/profile",
        templateUrl: 'partials/profile.html',
		controller: 'ProfileController'
    })
    .state('about', {
      url: "/about",
        templateUrl: 'partials/about.html',
		controller: 'AboutController'
    })
});

app.controller('ConfigController', ['$scope', function ($scope){
	$scope.title = 'Configuration';
	$scope.badge = 'dev';
	$scope.icon = 'cog'
}]);

app.controller('ProfileController', ['$scope', function ($scope){
	$scope.title = 'Mon profile';
	$scope.badge = 'dev';
	$scope.icon = 'user'
}]);

app.controller('HomeController', ['$scope',  function ($scope){
	$scope.title = 'Lokthar';
	$scope.badge = 'v0.1a';
	$scope.icon = 'home'


	$scope.openGitlab = function ()
	{
		var shell = require('shell');
		shell.openExternal('https://git.epsitec.ch');
	}

	$scope.openConsole = function ()
	{
		var ipc = require('ipc');
		ipc.send('open-console', '');
	}

	$scope.openSysroot = function ()
	{
		var shell = require('shell');
		var path  = require('path');
		shell.openItem(path.join(__dirname, '../../../'));
	}

	$scope.quit = function ()
	{
		var ipc = require('ipc');
		ipc.send('close-app', '');
	}
}]);

app.controller('AboutController', ['$scope', function ($scope){
	$scope.title = 'A propos';
	$scope.badge = 'dev';
	$scope.icon = 'question'
}]);
