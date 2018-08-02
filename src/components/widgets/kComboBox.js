/**
 * Created by Choyzer on 30/11/2014.
 */

/***********************************************
 * File Name: kComboBox.js
 * Created by: Chezi Hoyzer
 * On: 30/11/2014  15:05
 * Last Modified: 11/03/2015
 * Modified by: LSeverini
 ***********************************************/
(function ()
    {
        angular.module('components.widgets').directive("kComboBox",['$compile','$parse',function ($compile , $parse)
        {
            return {
                restrict: 'E',
                scope: {
                    initVal: '@',
                    options: '=',
                    label: '@',
                    value: '@',
                    onChange: '&', // must use like this: setClickFunctionName(insideVal) for deliver the value into the function
                    enabled: '=',
                    controlClass: '@',
                    ignoreInitValue: '@', // Send OnChange also if the value is the same as the init value
                    valueToListen:'=',
                    forceStringValue: '@'
                },
                template: "<select class='kComboBox {{controlClass}}'  " +
                                    "ng-class='{disabled : !enabled }' " +
                                    "ng-model='changeSelected'  " +
                                    "ng-disabled='!enabled'></select>",
                compile: function (tElement, tAttrs)
                    {
                        if (!tAttrs.initVal)
                            {
                                if (!tAttrs.initVal)
                                    { tAttrs.initVal = ""; }
                            }
                        if (!tAttrs.enabled)
                            { tAttrs.enabled = "true"; }
                        if (!tAttrs.controlClass)
                            { tAttrs.controlClass = ""; }

                        if (!tAttrs.ignoreInitValue)
                            { tAttrs.ignoreInitValue = "false"; }
                        if (!tAttrs.valueToListen)
                            { tAttrs.valueToListen= "void"; }

                        //$compile(element.contents())(scope)
                        if (!tAttrs.isArray)
                            { tAttrs.isArray= "false"; }

                            if (!tAttrs.forceStringValue)
                            { tAttrs.forceStringValue= "false"; }


                        var select = tElement.find('select'),
                            value = (tAttrs.value && tAttrs.value!='') ? 'x.' + tAttrs.value : 'x',
                            label = (tAttrs.label && tAttrs.label!='') ? 'x.' + tAttrs.label : 'x',
                            ngOptions = value + ' as ' + label + ' for x in options';

                        //select.attr('ng-options', ngOptions);
                        //ngOptions = 'x as x for x in options';
                        select.attr('ng-options', ngOptions);

                        return this.link;
                    },
                link: function (scope, element, attrs)
                    {

                        //var select = element.find('select'),
                        //        value = (attrs.value && attrs.value!='') ? 'x.' + attrs.value : 'x',
                        //        label = (attrs.label && attrs.label!='') ? 'x.' + attrs.label : 'x',
                        //        ngOptions = value + ' as ' + label + ' for x in options';
                        //
                        //select.attr('ng-options', ngOptions);
                        //$compile(element.contents())(scope);




                        var initval = parseInt(scope.initVal);
                        if(isNaN(initval) || scope.forceStringValue == "true")
                            scope.changeSelected =  scope.initVal;
                        else
                            scope.changeSelected = initval;
                        scope.valueToListen = scope.changeSelected;

                        if (!scope.ignoreInitValue)
                            { scope.ignoreInitValue = "false"; }

                        scope.$watch('changeSelected', function (val)
                        {
                            scope.valueToListen = val;
                            if ((!_.isUndefined(val) && val !=  scope.initVal && val !== "") || (scope.ignoreInitValue == "true"))
                                {
                                    scope.onChange({insideVal: val});
                                }
                        });

                        scope.$watch('initVal', function (val)
                        {

                            if(scope.forceStringValue == "true" || isNaN(val) || val == "")
                                {
                                    scope.changeSelected =  val;
                                }
                            else
                                {
                                    var val = parseInt(val);
                                    scope.changeSelected = val;
                                }
                            // //scope.changeSelected =  val;
                            // var initval = parseInt(val);
                            // //var toFind = "";
                            // if(isNaN(initval))
                            // {
                            //     scope.changeSelected =  val;
                            // }
                            // else
                            // {
                            //     scope.changeSelected = initval;
                            // }
                        });
                    }

            };
        }]);
    })();