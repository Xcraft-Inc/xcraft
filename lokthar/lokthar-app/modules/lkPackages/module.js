///LoKthar Packages
//
var module      = angular.module('lk-packages', ['checklist-model','lk-helpers', 'lk-bus']);

module.config(function($stateProvider, $urlRouterProvider) {
  var module_root = 'modules/lkPackages/';
  $urlRouterProvider.otherwise("/packages.manager");
  $stateProvider
    .state('packages', {
      url: "/packages",
      templateUrl: module_root + 'views/packages.html',
      controller: 'PackagesController'
    })
    .state('packages.editor', {
      url: '/editor/:packageName',
      views : {
        'main' : {
          templateUrl: module_root + 'views/editor.html',
          controller: function ($scope, $stateParams) {
            $scope.package.packageName = $stateParams.packageName;
            $scope.package.packageDef = [];
            $scope.editorStep = 1;
          }
        }
      }
    })
    .state('packages.editor.header', {
      url: '/header',
      templateUrl: module_root + 'views/editor.header.html',
      controller: 'PackageEditorHeaderController'
    })
    .state('packages.editor.dependency', {
      url: '/dependency',
      templateUrl: module_root + 'views/editor.dependency.html',
      controller: 'PackageEditorDependencyController'
    })
    .state('packages.editor.data', {
      url: '/data',
      templateUrl: module_root + 'views/editor.data.html',
      controller: 'PackageEditorDataController'
    })
    .state('packages.editor.finish', {
      url: '/finish',
      templateUrl: module_root + 'views/editor.finish.html',
      controller: 'PackageEditorFinishController'
    })
    .state('packages.manager', {
      url: "/manager",
      views : {
        'main' : {
          templateUrl:  module_root + 'views/manager.html',
          controller: 'PackageManagerController'
        }
      }
    })
});


//ROOT CONTROLLER
module.controller('PackagesController', ['$scope','busClient',
function ($scope, busClient)
{
  //hide menu
  $.UIkit.offcanvas.offcanvas.hide(false);

  //module tiny'def
  $scope.title     = 'Packages';
  $scope.badge     = 'module';
  $scope.icon      = 'puzzle-piece';

  //Evts handlers
  busClient.events.subscribe ('zogManager.list', function (msg)
  {
    $scope.safeApply( function(){
      $scope.products = msg.data;
    });
  });

  busClient.events.subscribe ('zogManager.edit.header.added', function (msg)
  {
    $scope.safeApply( function(){
      //header related fields and initial model
      $scope.headerFields         = msg.data;
      $scope.header               = {};
      $scope.header.architecture  = [];

      //assign defaults values
      Object.keys ($scope.headerFields).forEach (function (field)
      {
        var fieldName = $scope.headerFields[field].name;
        $scope.header[fieldName] = $scope.headerFields[field].default;
      });

      //Map lokthar wizard commands/response for each field
      Object.keys ($scope.headerFields).forEach (function (field)
      {

        var fieldName       = $scope.headerFields[field].name;
        var loktharCommands = $scope.headerFields[field].loktharCommands;

        var mapWizardCommands = function (command, actionKey)
        {
          if(!loktharCommands.hasOwnProperty(command))
            return;

          $scope.headerFields[field].actions = {};
          $scope.headerFields[field].actions[actionKey] = {};
          var action = $scope.headerFields[field].actions[actionKey]
          busClient.events.subscribe (loktharCommands[command], function (msg)
          {
            action.result = msg.data;
          });

          action.sendCommand  = function (value)
          {
            busClient.command.send (command, value || '', null);
          };

          action.sendCommand($scope.header[fieldName]);
        };

        mapWizardCommands ('pkgWizard.header.' + fieldName + '.validate',
                           'validate');

        var choicesCmd = 'pkgWizard.header.' + fieldName + '.choices';
        mapWizardCommands (choicesCmd,
                           'loadChoices');
      });

      //debug point: console.log (JSON.stringify($scope.headerFields,2,' '));
    });
  });

  busClient.events.subscribe ('zogManager.edit.dependency.added', function (msg)
  {
    $scope.safeApply( function(){
      //dependencies related fields and initial model
      $scope.dependencyFields     = msg.data;
      $scope.dependency           = {};
      $scope.dependencies         = {};

    });
  });

  busClient.events.subscribe ('zogManager.edit.data.added', function (msg)
  {
    $scope.safeApply( function(){
      //package content related fields and initial model
      $scope.packageContentFields = msg.data;
      $scope.packageContent       = {};

      //assign defaults values
      Object.keys ($scope.packageContentFields).forEach (function (field)
      {
        var fieldName = $scope.packageContentFields[field].name;
        $scope.header[fieldName] = $scope.packageContentFields[field].default;
      });
    });
  });

  busClient.events.subscribe ('zogManager.edit.finished', function (msg)
  {
    $scope.safeApply( function(){
      $state.go ('packages.manager');
    });
  });

  //Manager funtions & vars
  var countSelectedPkg = function ()
  {
    var count = 0;
    Object.keys ($scope.selected).forEach(function (key) {
      if($scope.selected[key])
        count++;
    });
    return count;
  };


  $scope.selected  = [];
  $scope.selectedCount = 0;

  $scope.selectPackage = function(pkgName)
  {
    $scope.selected[pkgName] = !$scope.selected[pkgName];
    $scope.selectedCount = countSelectedPkg();
  };

  //Editor funtions & vars
  $scope.package = {
    isPassive : true
  };

  $scope.resetPackage = function()
  {
    delete $scope.package;

    $scope.package = {
      isPassive : true,
      packageName : ''
    };

    console.log (JSON.stringify ($scope.package));
    busClient.command.send ('zogManager.edit.header', $scope.package);
  };

  //Global functions
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
  busClient.command.send ('zogManager.list');
}]);


module.controller('PackageEditorHeaderController', ['$scope','$state','$stateParams',
function ($scope, $state, $stateParams) {
  busClient.command.send ('zogManager.edit.header', $scope.package);

  $scope.nextStep = function ()
  {
    $scope.package.packageDef.push ($scope.header);
    busClient.command.send ('zogManager.edit.dependency',$scope.package);
    $scope.editorStep++;
    $state.go ('packages.editor.dependency', {packageName : $scope.package.packageName});
  };

}]);


module.controller('PackageEditorDependencyController', ['$scope','$state',
function ($scope, $state) {


 $scope.addDependency = function ()
 {
   //prepare dependencies hash from model
   var key = $scope.dependency.package;
   $scope.dependencies[key] = {};
   $scope.dependencies[key].hasDependency  = true;
   $scope.dependencies[key].dependency     = $scope.dependency.package;
   $scope.dependencies[key].version        = $scope.dependency.version;

   //clear dependency model for the next dependency
   $scope.dependency        = {};
 };

 $scope.nextStep = function ()
 {
   $state.go ('packages.editor.data', {packageName : $scope.package.packageName});
   $scope.package.packageDef.push ($scope.dependencies);
   busClient.command.send ('zogManager.edit.data',$scope.package);
   $scope.editorStep++;
 };


}]);


module.controller('PackageEditorDataController', ['$scope','$state',
function ($scope, $state) {
  $scope.nextStep = function ()
  {
    $state.go ('packages.editor.finish', {packageName : $scope.package.packageName});
    $scope.package.packageDef.push ($scope.packageContent);
    $scope.editorStep++;
  };

}]);

module.controller('PackageEditorFinishController', ['$scope','$state',
function ($scope, $state) {

  $scope.savePackage = function ()
  {
    busClient.command.send ('zogManager.edit.save',$scope.package);
  };

}]);
