///LoKthar Helpers
//
var module = angular.module('lk-helpers', []);

//Validator directive, watch validator attribue value to set validity
module.directive('validator', [function () {
    return {
        restrict: 'A',
        scope: {
          result: '=validator',
          model:  '=ngModel',
        },
        require : 'ngModel',
        link:
        function (scope, elem, attrs, control)
        {
          scope.$watch('result', function (data) {
            if(scope.result !== undefined)
            {
              console.log(scope.result);
              if(scope.result === true)
              {
                control.$setValidity("valid", true);
              }
              else
              {
                control.$setValidity("valid", false);
              }

            }
          });
        }
    };
}]);
