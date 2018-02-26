'use strict';
// LoKthar Packages
//
angular
  .module('lk-packages', ['checklist-model', 'lk-helpers', 'lk-bus'])
  .config(function($stateProvider, $urlRouterProvider) {
    var moduleRoot = 'modules/lkPackages/';
    $urlRouterProvider.otherwise('/packages.manager');
    $stateProvider
      .state('packages', {
        url: '/packages',
        templateUrl: moduleRoot + 'views/packages.html',
        controller: 'PackagesController',
      })
      .state('packages.editor', {
        url: '/editor/:packageName',
        views: {
          main: {
            templateUrl: moduleRoot + 'views/editor.html',
            controller: function($scope, $stateParams) {
              $scope.package.packageName = $stateParams.packageName;
              $scope.package.packageDef = [];
              $scope.editorStep = 1;
            },
          },
        },
      })
      .state('packages.editor.header', {
        url: '/header',
        templateUrl: moduleRoot + 'views/editor.header.html',
        controller: 'PackageEditorHeaderController',
      })
      .state('packages.editor.dependency', {
        url: '/dependency',
        templateUrl: moduleRoot + 'views/editor.dependency.html',
        controller: 'PackageEditorDependencyController',
      })
      .state('packages.editor.data', {
        url: '/data',
        templateUrl: moduleRoot + 'views/editor.data.html',
        controller: 'PackageEditorDataController',
      })
      .state('packages.editor.finish', {
        url: '/finish',
        templateUrl: moduleRoot + 'views/editor.finish.html',
        controller: 'PackageEditorFinishController',
      })
      .state('packages.manager', {
        url: '/manager',
        views: {
          main: {
            templateUrl: moduleRoot + 'views/manager.html',
            controller: 'PackageManagerController',
          },
        },
      });
  });
