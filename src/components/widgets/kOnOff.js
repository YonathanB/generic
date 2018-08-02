/***********************************************
 * File Name: kOnOff.js
 * Created by: Chezi Hoyzer
 * On: 21/09/2014  14:19
 * Last Modified: 21/09/2014
 * Modified by: Choyzer
 ***********************************************/
(function ()
{
    angular.module('components.widgets').directive("kOnOff", function ($timeout)
    {
        return {
            restrict: 'E',
            scope: {
                initVal: '@',
//                valuetolisten: '=',
                onClick: '&', // must use like this: setClickFunctionName(insideVal) for deliver the value into the function
                enabled: '=',
                activeText: '@',
                activeValue: '@',
                inactiveText: '@',
                inactiveValue: '@',
                showValueOnDisable: '@',
                isWaitingForResponse: '@',
                controlClass: '@',
                visible: '=',
                isWaiting: '@',
                valueToListen: '='

            },

            template: '<div ng-init="value=initVal" ng-show="visible" class="kOnOff {{controlClass}}" ng-class="{disabled:!enabled , on:initVal==activeValue , \'hide-button-on-disable\':showValueOnDisable==\'false\' , \'kOnOff-loading\':isWaiting==\'true\' && internalIsWaiting }" id="onOff_{{onoffid}}" >\
                        <div class="kOnOff-button"></div>    \
                        <div class="kOnOff-text-on" ng-click="enabled && (initVal.toString()==inactiveValue.toString()) && internalSetValue(activeValue, $event)">{{activeText}}</div>\
                        <div class="kOnOff-text-off" ng-click="enabled && (initVal.toString()==activeValue.toString())&& internalSetValue(inactiveValue, $event)">{{inactiveText}}</div>\
                    </div>',

            compile: function (element, attrs)
            {
                if (!attrs.initVal)
                    attrs.initVal = "1";
                if (!attrs.enabled)
                    attrs.enabled = "true";
                if (!attrs.activeText)
                    attrs.activeText = "ON";
                if (!attrs.activeValue)
                    attrs.activeValue = "1";
                if (!attrs.inactiveText)
                    attrs.inactiveText = "OFF";
                if (!attrs.inactiveValue)
                    attrs.inactiveValue = "0";
                if (!attrs.isWaitingForResponse)
                    attrs.isWaitingForResponse = "true";
                if (!attrs.showValueOnDisable)
                    attrs.showValueOnDisable = "true";
                if (!attrs.controlClass)
                    attrs.controlClass = "";
                if (!attrs.visible)
                    attrs.visible = "true";
                if (!attrs.valueToListen)
                    attrs.valueToListen = "true";
                if (!attrs.isWaiting)
                    attrs.isWaiting = "false";

                return this.link;
            },
            link: function (scope, element, attrs)
            {

                var $elem = element;
                scope.internalIsWaiting = false;
                if (!scope.onoffid)
                {
                    scope.onoffid = _.uniqueId();
                }
                //scope.internalValue = scope.initVal;

                scope.internalSetValue = function (val, event)
                {
                    scope.internalIsWaiting = true;
                    scope.valueToListen = val;
                    scope.onClick({insideVal: val});
                    if (scope.isWaitingForResponse == "false")
                    {
                        scope.initVal = val;
                    }
                    angular.element(event.target).trigger('change');
                };

                scope.$watch('valueToListen', function (newValue, oldValue) {
                    var classText = '.kOnOff-text-';

                    // prevent launching a click trigger on init
                    if (oldValue !== true && oldValue !== false && newValue !== true && newValue !== false) {
                        if (newValue === '0')
                            classText += 'off';
                        else
                            classText += 'on';
                        $timeout(function () {
                           if(scope.valueToListen != scope.initVal)
                               $elem.find(classText).trigger('click')
                        }, 700);
                    }
                });

                scope.$watch('initVal', function (val)
                {
                    scope.internalIsWaiting = false;
                    scope.initVal = val;
                    scope.valueToListen = val;
                });
            }
        };
    });
})();