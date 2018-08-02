/**
 * Created by CHoyzer on 07/10/2014.
 */
/***********************************************
 * File Name: kComboBoxSet.js
 * Created by: Leonardo Severini
 * On: 11/03/2015  10:00
 * Last Modified: 11/03/2015
 * Modified by:  Leonardo Severini
 ***********************************************/

(function ()
    {
        angular.module('components.widgets').directive("kComboBoxSet", function ()
        {
            return {
                restrict: 'E',
                scope: {
                    initVal: '@',
                    options: '=',
                    label: '@',
                    value: '@',
                    setClick: '&', // must use like this: setClickFunctionName(insideVal) for deliver the value into the function
                    enabled: '=',
                    controlClass: '@',
                    controlComboClass: '@',
                    controlButtonClass: '@',
                    isWaitingForResponse: '@',
                    valueToListen:'='
                },

                template: "<div class='kComboBoxSet tableRow'>\
                                <div class='tableCell'>\
                                    <k-combo-box ng-if='isArray==\"true\"' control-class='{{controlComboClass}}'  enabled='enabled' options='options' init-val='{{initVal}}' ignore-init-value='true' on-change='valueChanged(insideVal);' value-to-listen='void'></k-combo-box>\
                                    <k-combo-box ng-if='isArray!=\"true\"' value='{{value}}' label='{{label}}' control-class='{{controlComboClass}}'  enabled='enabled' options='options' init-val='{{initVal}}' ignore-init-value='true' on-change='valueChanged(insideVal);' value-to-listen='void'></k-combo-box>\
                                </div>\
                                <div class='tableCell'>\
                                   <k-button control-class='kButton-set {{controlButtonClass}}' visible='true'  enabled=internalEnable text='Set' click='InternalClick()' ></k-button>\
                                 </div>\
                           </div>",


                compile: function (element, attrs)
                    {

                        if (!attrs.enabled)
                            { attrs.enabled = "true"; }
                        if (!attrs.controlClass)
                            { attrs.controlClass = "" }
                        if (!attrs.controlComboClass)
                            { attrs.controlComboClass = "" }
                        if (!attrs.controlButtonClass)
                            { attrs.controlButtonClass = "" }
                        if (!attrs.valueToListen)
                            { attrs.valueToListen= "" }
                        if (!attrs.isWaitingForResponse)
                            { attrs.isWaitingForResponse = "true"; }
                        if(!attrs.value || !attrs.label)
                                attrs.isArray = "true";
                        else
                                attrs.isArray = "false";

                        return this.link;
                    },
                link: function (scope, el, attrs)
                    {
                        scope.isArray = attrs.isArray;

                        scope.internalEnable = false;
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
                            buttonEnable = false;
                            lastValue = val;
                            scope.internalEnable = scope.enabled && buttonEnable;
                        });

                        scope.$watch('enabled', function (val)
                        {
                            scope.internalEnable = buttonEnable && val;
                        });

                        scope.valueChanged = function(val){
                            scope.changedValue = val;
                        };

                        scope.$watch('changedValue', function (val)
                        {
                            //scope.valueToListen = scope.changedValue;
                            if (lastValue == val  || (scope.initVal == val  && !lastValue))
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
                                scope.valueToListen = scope.changedValue;
                                scope.setClick({insideVal: scope.changedValue});
                                if (scope.isWaitingForResponse == "false")
                                    {
                                        scope.initVal = scope.changedValue;
                                    }
                            }
                    }
            };
        });
    })();