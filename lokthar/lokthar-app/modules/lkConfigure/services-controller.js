'use strict';

angular
  .module('lk-configure')
  .controller('ServicesController', ['$scope',
    function ($scope) {
      // CHEST
      // Some wiz' for chest service
      $scope.chestFields = $scope.wizard.chest;
      $scope.chest = {};

      // init with loaded values
      $scope.wizard.chest.forEach(function (item) {
        $scope.chest[item.name] = $scope.conf.chest[item.name];
      });

      // BUS
      // Some wiz' for bus service
      $scope.busFields = $scope.wizard.bus;
      $scope.bus = {};

      // init with loaded values
      $scope.wizard.bus.forEach(function (item) {
        $scope.bus[item.name] = $scope.conf.bus[item.name];
      });


      // SAVING
      $scope.saveConfig = function () {
        var hasChanged = false;

        Object.keys($scope.bus).forEach(function (item) {
          if ($scope.conf.bus[item] !== $scope.bus[item]) {
            $scope.conf.bus[item] = $scope.bus[item];
            hasChanged = true;
          }
        });

        Object.keys($scope.chest).forEach(function (item) {
          if ($scope.conf.chest[item] !== $scope.chest[item]) {
            $scope.conf.chest[item] = $scope.chest[item];
            hasChanged = true;
          }
        });

        if (hasChanged) {
          $scope.saveUserConfig();
        }
      };
    }
  ]);
