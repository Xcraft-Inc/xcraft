'use strict';
// LoKthar Helpers
//
var mod = angular.module ('lk-helpers', []);

// Validator directive, watch validator attribue value to set validity
mod.directive ('validator', [
  function () {
    return {
      restrict: 'A',
      scope: {
        result: '=validator',
        model: '=ngModel',
      },
      require: 'ngModel',
      link: function (scope, elem, attrs, control) {
        scope.$watch ('result', function (data) {
          /* jshint ignore:line */
          if (scope.result !== undefined) {
            if (scope.result === true) {
              control.$setValidity ('valid', true);
            } else {
              control.$setValidity ('valid', false);
            }
          }
        });
      },
    };
  },
]);
