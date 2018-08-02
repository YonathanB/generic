/***********************************************
 * File Name: kRadioButton.js
 * Created by: fassous
 * On: 25/05/2015 14:25
 * Last Modified:
 * Modified by:
 ***********************************************/

(function ()
{
    angular.module('components.widgets').directive("kRadioButton",['$compile','$parse',function ($compile , $parse)
    {
        return {
            restrict: 'E',
            transclude:true,
            scope: {
                value: '@',
                initVal: '@',
                //onChange: '&', // must use like this: setClickFunctionName(insideVal) for deliver the value into the function
                enabled: '=',
                controlClass: '@',
                valueToListen:'=',
                verticalAlign:'@'
            },
            template:
            '<div class="kRadioButton {{controlClass}}">' +
                '<div class="kRadioButton-col1 kRadioButton-{{verticalAlign}}" >' +
                    '<label>'+
                        '<input ng-disabled="!enabled" type="radio" ng-model="valueToListen" ng-value="value" >'+
                        '<div class="kRadioButton-button"></div>'+
                    '</label>' +
                '</div>'+
                '<div class="kRadioButton-col2  kRadioButton-{{verticalAlign}}" ng-transclude></div>' +
            '</div>',
            templateOLD2: '<label class="kRadioButton {{controlClass}}">'+
                            '<input ng-disabled="!enabled" type="radio" ng-model="valueToListen" ng-value="value" >'+
                            '<div class="kRadioButton-button"></div>'+
                      '</label>'+
                      '<div class="kRadioButton-text" ng-transclude></div>',
            templateOLD: '<input ng-disabled="!enabled" class="kRadioButton {{controlClass}}" type="radio" ng-model="valueToListen" ng-value="value" >' +
            '<div ng-transclude></div>',
            compile: function (tElement, tAttrs)
            {
                if (!tAttrs.enabled)
                { tAttrs.enabled = "true"; }
                if (!tAttrs.controlClass)
                { tAttrs.controlClass = ""; }
               if (!tAttrs.valueToListen)
                { tAttrs.valueToListen= "void"; }
               if (!tAttrs.verticalAlign)
                 tAttrs.verticalAlign= "middle";
                return this.link;
            },
            link: function (scope, element, attrs)
            {

                scope.$watch('initVal', function (val)
                {
                    scope.valueToListen = val;
                    //if ((!_.isUndefined(val) && val !=  scope.initVal && val !== "") || (scope.ignoreInitValue == "true"))
                    //{
                        //scope.onChange({insideVal: val});
                    //}
                });
            }

        };
    }]);
})();