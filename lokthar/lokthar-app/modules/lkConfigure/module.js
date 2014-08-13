///LoKthar Configure
///

var module      = angular.module('lk-configure', ['checklist-model','lk-helpers']);
//Link relative zogConfig lib
var remote        = require('remote');
var path          = require('path');
var zogConfig     = remote.require (path.resolve('./scripts/zogConfig.js'))();

module.config(function($stateProvider, $urlRouterProvider) {
  var module_root = 'modules/lkConfigure/';

  $urlRouterProvider.otherwise("/configure");
  $stateProvider
    .state('configure', {
      abstract: true,
      url: "/configure",
      views: {
        'module': {
          templateUrl: module_root + 'views/config.html',
          controller: function($scope) {
            var yaml     = require ('js-yaml');
            var fs       = require ('fs');

            $scope.userYaml    = zogConfig.confDefaultFile;
            $scope.defaultYaml = zogConfig.confUserFile;

            $scope.data = '';

            try
            {
              /* Try with the user config file if possible. */
              data = fs.readFileSync ($scope.userYaml, 'utf8');
            }
            catch (err)
            {
              /* Else, we use the default config file. */
              data = fs.readFileSync ($scope.defaultYaml, 'utf8');
            }

            $scope.conf   = yaml.safeLoad (data);
            $scope.title  = 'Configuration';
            $scope.badge  = 'dev';
            $scope.icon   = 'cog';

            $scope.saveUserConfig = function ()
            {
              $scope.data = yaml.safeDump ($scope.conf);
              fs.writeFileSync ($scope.userYaml, $scope.data);
            }
          }
        },
        'chest@configure.services': {
          templateUrl:  module_root + 'views/chest.html',
        },
        'bus@configure.services': {
          templateUrl:  module_root + 'views/bus.html',
        }
      }
    })
    .state('configure.services',{
      url: "/configure/services",
      templateUrl:  module_root + 'views/services.html',
      controller: 'ServicesController'
    })
    .state('configure.directories',{
      url: "/configure/directories",
      templateUrl: module_root + 'views/directories.html',
      controller: 'DirectoriesController'
    });
});

module.controller('DirectoriesController', ['$scope', function ($scope){
  //Display some directories, with opening feature
  $scope.libRoot          = zogConfig.libRoot;
  $scope.productsRoot     = zogConfig.pkgProductsRoot;
  $scope.nodeModulesRoot  = zogConfig.nodeModulesRoot;

  $scope.openFolder = function (path)
  {
    var shell = require('shell');
    shell.openItem(path);
  };
}]);

module.controller('ServicesController', ['$scope', function ($scope){
  ///CHEST
  //Some wiz' for chest service
  var wizard              = require (zogConfig.confWizard);
  $scope.chestFields      = wizard.chest;
  $scope.chest            = {};

  //init with loaded values
  wizard.chest.forEach (function (item)
  {
    $scope.chest[item.name] = $scope.conf.chest[item.name];
  });

  ///BUS
  //Some wiz' for bus service
  $scope.busFields      = wizard.bus;
  $scope.bus            = {};

  //init with loaded values
  wizard.bus.forEach (function (item)
  {
    $scope.bus[item.name] = $scope.conf.bus[item.name];
  });


  //SAVING
  $scope.saveConfig = function ()
  {
    var hasChanged = false;

    Object.keys($scope.bus).forEach (function (item)
    {
      if ($scope.conf.bus[item] != $scope.bus[item])
      {
        $scope.conf.bus[item] = $scope.bus[item];
        hasChanged = true;
      }
    });

    Object.keys($scope.chest).forEach (function (item)
    {
      if ($scope.conf.chest[item] != $scope.chest[item])
      {
        $scope.conf.chest[item] = $scope.chest[item];
        hasChanged = true;
      }
    });

    if (hasChanged)
    {
      $scope.saveUserConfig();
    }
  };

}]);
