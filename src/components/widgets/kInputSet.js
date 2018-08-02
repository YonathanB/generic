/**
 * Created by CHoyzer on 07/10/2014.
 */
/***********************************************
 * File Name: kInputSet.js
 * Created by: Chezi Hoyzer
 * On: 07/10/2014  13:27
 * Last Modified: 07/10/2014
 * Modified by: CHoyzer
 ***********************************************/



(function ()
{


    angular.module('components.widgets').directive("kInputSet", function ()
    {
        return {
            restrict: 'E',
            scope: {
                type: '@',//can be 'number' for kUpDownRange and other for <input type={{type}}...
                enabled: '=',
                setClick: '&', // must use like this: setClickFunctionName(insideVal) for deliver the value into the function
                min: '@',//only for type: 'number'
                max: '@',//only for type: 'number'
                unit: '@',//only for type: 'number'
                controlInputClass: '@',
                controlClass: '@',
                controlButtonClass: '@',
                isWaitingForResponse: '@',
                initVal: '@',
                enterClick: '&',
                buttonText: '@'

            },

            template: "<div class='tableRow kInputSet {{controlClass}}'>\
                                <div class='tableCell'>\
                                        <k-input enter-click='internalEnable && InternalClick()' ng-if='type == \"number\"' unit='{{unit}}' init-val='{{initVal}}' control-input-class='{{controlInputClass}}'  max='{{max}}' min='{{min}}' value-to-listen='valuetolisten' value='$parent.value' enabled='enabled' show-input-arrows='true'>\
                                        </k-input>\
                                        <input ng-if='type != \"number\"' class='{{controlInputClass}}' ng-keydown='keydownpress($event)'  ng-attr-type='{{type}}' ng-attr-value='{{initVal}}' ng-model='$parent.value' ng-disabled='!enabled'>\
                                        </input>\
                                </div>\
                                <div class='tableCell'>\
                                         <div style='margin-left: 6px'>\
                                           <k-button visible='true' enabled=internalEnable control-class='{{controlButtonClass ? controlButtonClass : \"kButton-set\" }}' text='{{buttonText}}' click='InternalClick()' ></k-button>\
                                         </div>\
                                 </div>\
                           </div>",


            compile: function (element, attrs)
            {
                if (attrs.buttonText != "")
                { attrs.buttonText = "Set"; }
                if (!attrs.type)
                { attrs.type = "text"; }
                if (!attrs.value)
                { attrs.value = ""; }
                if (!attrs.enabled)
                { attrs.enabled = "true"; }
                if (!attrs.isWaitingForResponse)
                { attrs.isWaitingForResponse = "true"; }
                if (!attrs.max)
                { attrs.max = 600 }
                if (!attrs.min)
                { attrs.min = -500 }

                if (!attrs.controlInputClass)
                { attrs.controlInputClass = "";}//"kUpDownInput" }
                if (!attrs.unit)
                { attrs.unit = "" }


                return this.link;
            },
            link: function (scope, el, attrs)
            {

                scope.internalEnable = true;
                var buttonEnable = false;
                var lastValue = null;

                if (!attrs.setClick)//default value for setClick
                {
                    scope.setClick = function (val)
                    {
                        alert("val:" + val)
                    };
                }
                scope.$watch('initVal', function (val)
                {
                    if (scope.type == "number")
                    {
                        if (!isNaN(val))
                        {
                            scope.value = parseInt(val);
                            scope.valuetolisten = parseInt(val);
                        }
                    }
                    else
                    {
                        scope.value = val;
                        scope.valuetolisten = val;
                    }

                    buttonEnable = false;
                    lastValue = scope.value;
                    scope.internalEnable = scope.enabled && buttonEnable;
                });

                scope.$watch('enabled', function (val)
                {
                    scope.internalEnable = buttonEnable && val;
                });

                scope.$watch('value', function (val)
                {
                    if (lastValue == scope.value
                        || (scope.initVal == scope.value && !lastValue)
                        || (scope.type == "number" && scope.value < scope.min)
                        || (scope.type == "number" && scope.value > scope.max)
                    )
                    {
                        buttonEnable = false;
                    }
                    else
                    {
                        buttonEnable = true;
                    }
                    scope.internalEnable = scope.enabled && buttonEnable;
                });

                scope.InternalClick = function ()
                {
                    scope.setClick({insideVal: scope.value});
                    if (scope.isWaitingForResponse == "false")
                    {
                        scope.initVal = scope.value;
                    }
                };

                scope.keydownpress = function (e)
                {
                    var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
                    if (key == 13 && scope.enabled && buttonEnable)//Enter
                    {
                        scope.InternalClick();
                    }
                };


            }
        };
    });
})();
