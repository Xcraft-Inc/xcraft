'use strict';
// LoKthar Configure
//
angular
  .module ('lk-configure', ['checklist-model', 'lk-helpers'])
  .config (function ($stateProvider, $urlRouterProvider) {
    var moduleRoot = 'modules/lkConfigure/';
    $urlRouterProvider.otherwise ('/configure');
    $stateProvider
      .state ('configure', {
        abstract: true,
        url: '/configure',
        views: {
          module: {
            templateUrl: moduleRoot + 'views/config.html',
            controller: function ($scope) {
              var yaml = require ('js-yaml');
              var fs = require ('fs');
              // hide menu
              $.UIkit.offcanvas.offcanvas.hide (false);

              //todo : refactor with xcraft-core-etc
              //$scope.wizard = require(zogConfig.confWizard);
              //$scope.userYaml = zogConfig.confDefaultFile;
              //$scope.defaultYaml = zogConfig.confUserFile;
              //$scope.productsRoot = zogConfig.pkgProductsRoot;
              //$scope.nodeModulesRoot = zogConfig.nodeModulesRoot;

              $scope.data = '';

              try {
                /* Try with the user config file if possible. */
                var data = fs.readFileSync ($scope.userYaml, 'utf8');
                $scope.conf = yaml.safeLoad (data);
              } catch (err) {
                /* Else, we use the default config file. */
                data = fs.readFileSync ($scope.defaultYaml, 'utf8');
              }

              $scope.title = 'Configuration';
              $scope.badge = 'dev';
              $scope.icon = 'cog';

              $scope.saveUserConfig = function () {
                $scope.data = yaml.safeDump ($scope.conf);
                fs.writeFileSync ($scope.userYaml, $scope.data);
              };
            },
          },
          'chest@configure.services': {
            templateUrl: moduleRoot + 'views/chest.html',
          },
          'bus@configure.services': {
            templateUrl: moduleRoot + 'views/bus.html',
          },
        },
      })
      .state ('configure.services', {
        url: '/configure/services',
        templateUrl: moduleRoot + 'views/services.html',
        controller: 'ServicesController',
      })
      .state ('configure.directories', {
        url: '/configure/directories',
        templateUrl: moduleRoot + 'views/directories.html',
        controller: 'DirectoriesController',
      });
  });
