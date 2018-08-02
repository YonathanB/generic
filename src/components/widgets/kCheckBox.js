/**
 * Created by Choyzer on 30/11/2014.
 */
/***********************************************
 * File Name: kCheckBox.js
 * Created by: Chezi Hoyzer
 * On: 30/11/2014  12:01
 * Last Modified: 15/04/2015
 * Modified by: Fassous
 ***********************************************/
(function ()
    {
        angular.module('components.widgets').directive("kCheckBox", function ()
        {
            return {
                restrict: 'E',
                scope: {
                    initVal: '@',
                    onChange: '&', // must use like this: setClickFunctionName(insideVal) for deliver the value into the function
                    enabled: '=',
                    isWaitingForResponse: '@',
                    controlClass: '@'
                },
                //template: "<input type='checkbox'  ng-model='changeChecked' ng-class='controlClass' ng-disabled='!enabled' >",
                template: "<input type='checkbox' ng-model='value' ng-change='changeValue()' ng-checked='value' class='kCheckBox {{controlClass}}'  ng-class='{disabled : !enabled }' ng-disabled='!enabled' >",
                compile: function (element, attrs)
                    {

                        if (!attrs.initVal)
                            { attrs.initVal = "true"; }
                        if (!attrs.enabled)
                            { attrs.enabled = "true"; }
                        if (!attrs.controlClass)
                            { attrs.controlClass = ""; }
                        if (!attrs.isWaitingForResponse)
                            { attrs.isWaitingForResponse = "true"; }
                        return this.link;
                    },
                link: function (scope, element, attrs)
                    {

                        scope.value = attrs.initVal=="true";

                        scope.changeValue = function()
                        {
                            if (utils.isTrue( (scope.initVal=="true") != scope.value ))
                            {
                                scope.onChange({insideVal: $(element[0].children[0]).prop("checked")});

                                if (scope.isWaitingForResponse == "false")
                                    {
                                        scope.initVal = $(element[0].children[0]).prop("checked");
                                    }
                            }
                        };

                        scope.$watch('initVal', function (val)
                        {
                            scope.value = val=="true";
                        });
                        //$(element[0].children[0]).on('change', function ()
                        //{
                        //    scope.$apply(function ()
                        //    {
                        //        if (utils.isTrue(scope.initVal != $(element[0].children[0]).prop("checked")))
                        //            {
                        //                scope.onChange({insideVal: $(element[0].children[0]).prop("checked")});
                        //            }
                        //    });
                        //});


                        //scope.$watch('initVal', function (val)
                        //{
                        //    if (utils.isTrue(val))
                        //        {
                        //            $(element[0].children[0]).prop("checked", true);
                        //        }
                        //    else
                        //        {
                        //            $(element[0].children[0]).prop("checked", false);
                        //        }
                        //});
                    }

            };
        });
    })();