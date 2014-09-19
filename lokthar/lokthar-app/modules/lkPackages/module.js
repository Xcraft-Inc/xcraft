'use strict';
// LoKthar Packages
//
var mod = angular.module('lk-packages', ['checklist-model', 'lk-helpers', 'lk-bus']);

mod.config (function ($stateProvider, $urlRouterProvider) {
  var moduleRoot = 'modules/lkPackages/';
  $urlRouterProvider.otherwise('/packages.manager');
  $stateProvider
    .state('packages', {
      url: '/packages',
      templateUrl: moduleRoot + 'views/packages.html',
      controller: 'PackagesController'
    })
    .state('packages.editor', {
      url: '/editor/:packageName',
      views : {
        main : {
          templateUrl: moduleRoot + 'views/editor.html',
          controller: function ($scope, $stateParams) {
            $scope.package.packageName = $stateParams.packageName;
            $scope.package.packageDef  = [];
            $scope.editorStep = 1;
          }
        }
      }
    })
    .state('packages.editor.header', {
      url: '/header',
      templateUrl: moduleRoot + 'views/editor.header.html',
      controller: 'PackageEditorHeaderController'
    })
    .state('packages.editor.dependency', {
      url: '/dependency',
      templateUrl: moduleRoot + 'views/editor.dependency.html',
      controller: 'PackageEditorDependencyController'
    })
    .state('packages.editor.data', {
      url: '/data',
      templateUrl: moduleRoot + 'views/editor.data.html',
      controller: 'PackageEditorDataController'
    })
    .state('packages.editor.finish', {
      url: '/finish',
      templateUrl: moduleRoot + 'views/editor.finish.html',
      controller: 'PackageEditorFinishController'
    })
    .state('packages.manager', {
      url: '/manager',
      views : {
        main : {
          templateUrl:  moduleRoot + 'views/manager.html',
          controller: 'PackageManagerController'
        }
      }
    });
});

// ROOT CONTROLLER
mod.controller('PackagesController', ['$scope', 'busClient', function ($scope, busClient) {
  // hide menu
  $.UIkit.offcanvas.offcanvas.hide(false);

  // module tiny'def
  $scope.title     = 'Packages';
  $scope.badge     = 'module';
  $scope.icon      = 'puzzle-piece';

  // Evts handlers
  busClient.events.subscribe ('zogManager.list', function (msg) {
    $scope.safeApply( function () {
      $scope.products = msg.data;
    });
  });

  busClient.events.subscribe ('zogManager.edit.header.added', function (msg) {
    $scope.safeApply( function () {
      // header related fields and initial model
      $scope.headerFields         = msg.data;
      $scope.header               = {};
      $scope.header.architecture  = [];

      // assign defaults values
      Object.keys ($scope.headerFields).forEach (function (field) {
        var fieldName = $scope.headerFields[field].name;
        $scope.header[fieldName] = $scope.headerFields[field].default;
      });

      // Map lokthar wizard commands/response for each field
      $scope.mapFieldActions ($scope.headerFields, $scope.header, 'header');
      $scope.initFormWithActions ('loadChoices', $scope.headerFields, '');
      // debug point: console.log (JSON.stringify($scope.headerFields,2,' '));
    });
  });

  busClient.events.subscribe ('zogManager.edit.dependency.added', function (msg) {
    $scope.safeApply( function () {
      // dependencies related fields and initial model
      $scope.dependencyFields     = msg.data;
      $scope.dependency           = {};

      // assign defaults values
      $scope.dependency.hasDependency = $scope.dependencyFields[0].default;
      var packageIdx = $scope.dependencyFields[1].default;
      $scope.dependency.dependency = $scope.dependencyFields[1].choices[packageIdx];
      $scope.dependency.version = $scope.dependencyFields[2].default;
    });
  });

  busClient.events.subscribe ('zogManager.edit.data.added', function (msg) {
    $scope.safeApply( function () {
      // package content related fields and initial model
      $scope.packageContentFields = msg.data;
      $scope.packageContent       = {};

      // assign defaults values
      Object.keys ($scope.packageContentFields).forEach (function (field) {
        var fieldName = $scope.packageContentFields[field].name;
        $scope.packageContent[fieldName] = $scope.packageContentFields[field].default;
      });

      $scope.mapFieldActions ($scope.packageContentFields, $scope.packageContent, 'data');

      $scope.initFormWithActions ('loadChoices', $scope.packageContentFields, $scope.packageContent);
      $scope.initFormWithActions ('displayed', $scope.packageContentFields, $scope.packageContent);
    });
  });

  busClient.events.subscribe ('zogManager.edit.finished', function (msg) { // jshint ignore:line
    $scope.safeApply( function () {
      $state.go ('packages.manager');
    });
  });

  // Manager funtions & vars
  var countSelectedPkg = function () {
    var count = 0;
    Object.keys ($scope.selected).forEach(function (key) {
      if ($scope.selected[key]) {
        count++;
      }
    });
    return count;
  };


  $scope.selected  = [];
  $scope.selectedCount = 0;

  $scope.selectPackage = function (pkgName) {
    $scope.selected[pkgName] = !$scope.selected[pkgName];
    $scope.selectedCount = countSelectedPkg();
  };

  // Editor funtions & vars
  $scope.package = {
    isPassive : true
  };

  $scope.resetPackage = function () {
    delete $scope.package;

    $scope.package = {
      isPassive : true,
      packageName : ''
    };

    console.log (JSON.stringify ($scope.package));
    busClient.command.send ('zogManager.edit.header', $scope.package);
  };

  // Global functions
  $scope.safeApply = function (fn) {
    var phase = this.$root.$$phase;
    if (phase === '$apply' || phase === '$digest') {
      if (fn && (typeof (fn) === 'function')) {
        fn();
      }
    } else {
      this.$apply(fn);
    }
  };

  $scope.mapFieldActions = function (wizardFields, part, partName) {
    Object.keys (wizardFields).forEach (function (field) {
      var fieldName       = wizardFields[field].name;
      var loktharCommands = wizardFields[field].loktharCommands;
      var validateCmd  = 'pkgWizard.' + partName + '.' + fieldName + '.validate';
      var choicesCmd   = 'pkgWizard.' + partName + '.' + fieldName + '.choices';
      var whenCmd      = 'pkgWizard.' + partName + '.' + fieldName + '.when';

      var mapWizardCommands = function (command, actionKey, execute) {
        if (!loktharCommands.hasOwnProperty(command)) {
          return;
        }

        wizardFields[field].actions = {};
        wizardFields[field].actions[actionKey] = {};
        var action = wizardFields[field].actions[actionKey];
        busClient.events.subscribe (loktharCommands[command], function (msg) {
          action.result = msg.data;
        });

        action.sendCommand  = function (value) {
          busClient.command.send (command, value || '', null);
        };

        if (execute) {
          action.sendCommand(part[fieldName]);
        }
      };

      mapWizardCommands (validateCmd, 'validate', true);
      mapWizardCommands (choicesCmd, 'loadChoices', false);
      mapWizardCommands (whenCmd, 'displayed', false);
    });
  };

  $scope.initFormWithActions = function (action, fields, answers) {
    Object.keys (fields).forEach (function (field) {
      if (fields[field].actions !== undefined &&
          fields[field].actions.hasOwnProperty (action)) {
        fields[field].actions[action].sendCommand(answers);
      }
    });
  };
}]);

mod.controller('PackageManagerController', ['$scope', 'busClient', function ($scope, busClient) {
  busClient.command.send ('zogManager.list');
}]);

mod.controller('PackageEditorHeaderController', ['$scope', '$state', '$stateParams', function ($scope, $state, $stateParams) {
  busClient.command.send ('zogManager.edit.header', $scope.package);

  $scope.nextStep = function () {
    $scope.package.packageDef.push ($scope.header);

    /* Indices for the dependency.*/
    $scope.package.idxDep   = 0;
    $scope.package.idxRange = 0;


    $scope.editorStep++;
    $state.go ('packages.editor.dependency', {packageName : $scope.package.packageName});
    busClient.command.send ('zogManager.edit.dependency', $scope.package);
  };
}]);

mod.controller('PackageEditorDependencyController', ['$scope', '$state', function ($scope, $state) {
  $scope.nextStep = function () {
    var hasDependency = $scope.dependency.hasDependency;

    if (hasDependency) {
      // prepare dependencies hash from model
      $scope.package.packageDef.push ($scope.dependency);
      $scope.package.idxRange++;
      busClient.command.send ('zogManager.edit.dependency', $scope.package);
    } else {
      $scope.package.idxDep++;
      $scope.editorStep++;
      $state.go ('packages.editor.data', {packageName : $scope.package.packageName});

      busClient.command.send ('zogManager.edit.data', $scope.package);
    }
  };
}]);


mod.controller('PackageEditorDataController', ['$scope', '$state', function ($scope, $state) {
  $scope.isDisplayed = function (field) {
    if (field.actions.displayed === undefined) {
      return true;
    } else {
      field.actions.displayed.result;
    }
  };

  $scope.reloadChoices = function (field) {
    if (field === 'fileType') {
      $scope.initFormWithActions ('choicesLoaded', $scope.packageContentFields, $scope.packageContent);
    }

    $scope.initFormWithActions ('displayed', $scope.packageContentFields, $scope.packageContent);
  };

  $scope.nextStep = function () {
    $state.go ('packages.editor.finish', {packageName : $scope.package.packageName});
    $scope.package.packageDef.push ($scope.packageContent);
    $scope.editorStep++;
  };
}]);

mod.controller('PackageEditorFinishController', ['$scope', '$state', function ($scope, $state) {
  $scope.savePackage = function () {
    busClient.command.send ('zogManager.edit.save', $scope.package);
  };
}]);
