///LoKthar Packages
//
var module      = angular.module('lk-packages', ['checklist-model','lk-helpers', 'lk-bus']);

module.config(function($stateProvider, $urlRouterProvider) {
  var module_root = 'modules/lkPackages/';
  $urlRouterProvider.otherwise("/packages.manager");
  $stateProvider
    .state('packages', {
      templateUrl: module_root + 'views/packages.html',
      controller: 'PackagesController'
    })
    .state('packages.manager', {
      url: "/packages/manager",
      views :{
        'main' : {
          templateUrl:  module_root + 'views/manager.html',
          controller: 'PackageManagerController'
        }
      }
    })
    .state('packages.editor', {
      abstract : false,
      url: "/packages/editor",
      views : {
        'main' : {
          templateUrl: module_root + 'views/editor.html',
          controller: function ($scope) {
            $scope.package = {
              isPassive : true,
              packageName : 'new-package'
            };
          }
        },
        'header@packages.editor' : {
          templateUrl: module_root + 'views/editor.header.html',
          controller: 'PackageEditorHeaderController'
        },
        'dependency@packages.editor' : {
          templateUrl: module_root + 'views/editor.dependency.html',
          controller: 'PackageEditorDependencyController'
        },
        'data@packages.editor' : {
          templateUrl: module_root + 'views/editor.data.html',
          controller: 'PackageEditorDataController'
        },
        'finish@packages.editor' : {
          templateUrl: module_root + 'views/editor.finish.html',
          controller: 'PackageEditorFinishController'
        }
      }
    })
});

module.controller('PackagesController', ['$scope', function ($scope){
  $scope.title = 'Packages';
  $scope.badge = 'module';
  $scope.icon  = 'puzzle-piece';

  $scope.safeApply = function(fn)
  {
    var phase = this.$root.$$phase;
    if(phase == '$apply' || phase == '$digest') {
      if(fn && (typeof(fn) === 'function')) {
        fn();
      }
    } else {
      this.$apply(fn);
    }
  };

}]);

module.controller('PackageManagerController',
['$scope', 'busClient',
function ($scope, busClient){

  busClient.events.subscribe ('zogManager.list', function (msg)
  {
    $scope.safeApply( function(){
      $scope.products = msg.data;
    });
  });

  busClient.command.send ('zogManager.list');

}]);


module.controller('PackageEditorHeaderController', ['$scope','$state',
function ($scope, $state) {

  busClient.events.subscribe ('zogManager.edit.header.added', function (msg)
  {
    $scope.safeApply( function(){
      //header related fields and initial model
      $scope.headerFields         = msg.data;
      $scope.header               = {};
      $scope.header.architecture  = [];
    });
  });

  busClient.command.send ('zogManager.edit.header', $scope.package);

}]);


module.controller('PackageEditorDependencyController', ['$scope','$state',
function ($scope, $state) {

 busClient.events.subscribe ('zogManager.edit.dependency.added', function (msg)
 {
   $scope.safeApply( function(){
     //dependencies related fields and initial model
     $scope.dependencyFields     = msg.data;
     $scope.dependency           = {};
     $scope.dependencies         = {};
   });
 });

 busClient.command.send ('zogManager.edit.dependency',$scope.package);

 $scope.addDependency = function ()
 {
   //prepare dependencies hash from model
   var key = $scope.dependency.package;
   $scope.dependencies[key] = {};
   $scope.dependencies[key].hasDependency  = true;
   $scope.dependencies[key].dependency     = $scope.dependency.package;
   $scope.dependencies[key].version        = $scope.dependency.version;

   busClient.command.send ('zogManager.edit.dependency',$scope.package);
   //clear dependency model for the next dependency
   $scope.dependency        = {};
 };


}]);


module.controller('PackageEditorDataController', ['$scope','$state',
function ($scope, $state) {

  busClient.events.subscribe ('zogManager.edit.data.added', function (msg)
  {
    $scope.safeApply( function(){
      //package content related fields and initial model
      $scope.packageContentFields = msg.data;
      $scope.packageContent       = {};
    });
  });

  busClient.command.send ('zogManager.edit.data',$scope.package);

}]);

module.controller('PackageEditorFinishController', ['$scope','$state',
function ($scope, $state) {

  $scope.savePackage = function ()
  {
    //final template for package creation
    var packageTemplate         = [];
    //add header to package template
    packageTemplate.push($scope.header);
    //add dependencies to package template
    for(var d in $scope.dependencies)
    {
      packageTemplate.push($scope.dependencies[d]);
    }
    //send template to browser side, for package creation
    //var ipc = require('ipc');
    //ipc.send('create-package', packageTemplate);
    //$state.go('packages.manager');
  };

}]);
