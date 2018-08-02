/**
 * Created by Choyzer on 19/01/2015.
 */
/***********************************************
 * File Name: kContentButton.js
 * Created by: Chezi Hoyzer
 * On: 19/01/2015  15:52
 * Last Modified: 19/01/2015
 * Modified by: Choyzer
 ***********************************************/

(function ()
    {
        angular.module('components.widgets').directive("kContentButton", ['$timeout', function ($timeout)
            {
                //Note if you are using this control with inner button and you don't want it's will affect on kContentButton enter the following line: $event.stopPropagation();
                //for example -
                //  <k-content-button click="nav.activeIndex = $index" ng-repeat="btn in buttonList"
                //       control-class="routeButton" active="nav.activeIndex == $index">
                //         <button ng-click="someFunction(); $event.stopPropagation();">{{btn}}</button>
                //  </ k-content-button >
                return {
                    restrict: 'E',
                    transclude: true,
                    replace: true,
                    scope: {
                        active: '=',
                        enabled: '=',
                        controlClass: '@',
                        click: '&',
                        visible:'=',
                        selected: '=',
                        title:'@'

                    },
                    template: function (element, attrs)
                        {
                            return "<div  ng-show='visible' title='{{title}}' ng-click='actualClick()' ng-class='{active : active && enabled , selected: selected && enabled, disabled : !enabled}' class='kContentButton {{controlClass}}'  ng-transclude></div>";
                        },
                    compile: function (element, attrs)
                        {
                            if (!attrs.controlClass)
                                { attrs.controlClass = ""; }
                            if (!attrs.enabled)
                                { attrs.enabled = "true"; }
                            if (!attrs.active)
                                { attrs.active = "true"; }
                            if (!attrs.visible)
                                { attrs.visible = "true"; }
                            if (!attrs.selected) {
                                attrs.selected = "false";
                            }

                            //the Link function
                            return this.link;
                        },
                    link: function (scope, element, attrs)
                        {

                            if (!scope.click)
                                {
                                    scope.click = function ()
                                        {
                                            alert("kContentButton click: Not implement")
                                        };
                                }

                            scope.actualClick = function(){
                                $timeout(function ()
                                {
                                    scope.$apply(function ()
                                    {
                                        scope.hoverClass = '';
                                    });
                                });

                                if(scope.enabled)
                                    scope.click();
                            };
                        }
                };
            }]);
    })();



