///LoKthar Helpers
//
var module = angular.module('lk-helpers', []);

//Validator directive, call action in attr, and set
//validity for the form field.
module.directive('validator', [function () {
    return {
        restrict: 'A',
        scope: {
          action: '&validator',
          model:  '=ngModel',
        },
        require: 'ngModel',
        link: function (scope, elem, attrs, control) {
              scope.$watch('model', function (data) {
                if(scope.model!==undefined)
                {
                  var action = scope.action();
                  if(action !== undefined)
                  {
                    control.$setValidity("valid", action(scope.model));
                  }
                }
              });
        }
    };
}]);
