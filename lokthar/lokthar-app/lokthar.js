var app         = angular.module('lokthar', ['ui.router', 'lk-packages','lk-configure']);

app.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/home');
  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: 'partials/home.html',
    controller: 'HomeController'
    })
    .state('profile', {
      url: '/profile',
        templateUrl: 'partials/profile.html',
    controller: 'ProfileController'
    })
    .state('about', {
      url: '/about',
        templateUrl: 'partials/about.html',
    controller: 'AboutController'
    })
});

app.controller('ProfileController', ['$scope', function ($scope){
  $scope.title = 'Mon profile';
  $scope.badge = 'dev';
  $scope.icon = 'user'
}]);

app.controller('HomeController', ['$scope', function ($scope){
  $scope.title = 'Lokthar';
  $scope.badge = 'v0.1a';
  $scope.icon = 'home';
  $scope.maximized = false;

  $scope.openGitlab = function ()
  {
    var shell = require('shell');
    shell.openExternal('https://git.epsitec.ch');
  };

  $scope.openConsole = function ()
  {
    var ipc = require('ipc');
    ipc.send('open-console', '');
  };

  $scope.openSysroot = function ()
  {
    var shell = require('shell');
    var path  = require('path');
    shell.openItem(path.join(__dirname, '../../../'));
  };

  $scope.minimize = function ()
  {
    var ipc = require('ipc');
    ipc.send('minimize', '');
  };

  $scope.maximize = function ()
  {
    var ipc = require('ipc');
    if(!$scope.maximized)
    {
      ipc.send('maximize', '');
      $scope.maximized = true;
    }
    else
    {
      ipc.send('unmaximize', '');
      $scope.maximized = false;
    }

  };

  $scope.quit = function ()
  {
    var ipc = require('ipc');
    ipc.send('close-app', '');
  };

}]);

app.controller('AboutController', ['$scope', function ($scope){
  $scope.title  = 'A propos';
  $scope.badge  = 'dev';
  $scope.icon   = 'question'
}]);
