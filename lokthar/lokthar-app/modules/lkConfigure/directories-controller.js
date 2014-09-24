'use strict';

angular
  .module('lk-configure')
  .controller('DirectoriesController', ['$scope',
    function($scope) {

      $scope.openFolder = function(path) {
        var shell = require('shell');
        shell.openItem(path);
      };
    }
  ]);