/**
 * Created by Choyzer on 11/01/2015.
 */

/***********************************************
 * File Name: kTabs.js
 * Created by: Chezi Hoyzer
 * On: 11/01/2015  10:08
 * Last Modified: 15/04/2015
 * Modified by: Fassous
 ***********************************************/

(function ()
    {

        angular.module('components.widgets').directive("kTabs", function ()
        {
            return {
                restrict: 'E',
                transclude: true,
                scope: {
                    tabContentClass: '@',
                    tabSelected: '@'
                },

                template: "<div class='kTabs'>\
                                 <div class='k-tab-style' ng-repeat='tab in tabs track by $index' ng-click='setSelected(tab); tab.click()'  ng-attr-title='{{tab.tabTitle}}'  ng-class='{selected : tab.selected}'>\
                                    <div class='k-tab-title-text' >{{tab.tabTitle}}</div>\
                                 </div>\
                           </div>\
                           <div class='k-tab-content {{tabContentClass}}' ng-transclude></div>",

                compile: function (element, attrs)
                    {
                        if (!attrs.tabContentClass)
                            {
                                attrs.tabContentClass = "";
                            }
                        if (!attrs.tabSelected)
                            {
                                attrs.tabSelected = 0;
                            }
                    },
                controller: function ($scope)
                    {
                        $scope.tabs = [];

                        $scope.setSelected = function (tab)
                            {
                                angular.forEach($scope.tabs, function (tab)
                                {
                                    tab.selected = false;
                                });
                                if(angular.isDefined(tab))  tab.selected = true;
                            };

                        $scope.$watch('tabSelected', function (nv, ov)
                        {
                            if (angular.isDefined(nv) && $scope.tabs.length > 0)
                                {
                                    $scope.setSelected($scope.tabs[parseInt(nv)]);
                                }
                        });

                        this.addTab = function (tab, index)
                            {
                                if ($scope.tabs.length === 0)
                                    {
                                        $scope.setSelected(tab);
                                    }


                                if (angular.isDefined(index))
                                    {
                                        $scope.tabs[index] = tab;
                                        if ($scope.tabSelected == index)
                                            {
                                                $scope.setSelected(tab);
                                            }
                                    }
                                else
                                    {
                                        $scope.tabs.push(tab);
                                        if ($scope.tabSelected == $scope.tabs.length - 1)
                                            {
                                                $scope.setSelected(tab);
                                            }
                                    }
                            };

                        this.removeTab = function (tab, index)
                            {
                                if (angular.isDefined(index))
                                    {
                                        $scope.tabs.splice(index, 1);
                                        if (tab.selected)
                                            {
                                                if ($scope.tabs.length) {
                                                    $scope.setSelected($scope.tabs[0]);
                                                }
                                            }
                                    }
                                else
                                    {
                                        $scope.tabs = $scope.tabs
                                            .filter(function (el)
                                            {
                                                return el.tabTitle !== tab.tabTitle;
                                            });
                                        if (tab.selected)
                                            {
                                                if ($scope.tabs.length) {
                                                    $scope.setSelected($scope.tabs[0]);
                                                }
                                            }
                                    }
                            };


                    }
            };
        });
        angular.module('components.widgets').directive("kTab", function ()
        {
            return {
                require: '^kTabs',
                restrict: 'E',
                transclude: true,
                scope: {
                    tabTitle: '@',
                    click: '&',
                    visible: '=',
                    index: '@'
                },

                template: "<div ng-if='selected' class='kTab change-content-animate-show' ng-transclude>\
                           </div>",
                compile: function (element, attrs)
                    {
                        // Set the default values

                        if (!attrs.visible)
                            { attrs.visible = "true"; }
                        if (!attrs.tabTitle)
                            { attrs.tabTitle = "put title"; }


                        return this.link;
                    },

                link: function (scope, element, attrs, tabsCtrl)
                    {
                        scope.$watch('visible', function (nv)
                        {
                            if (nv)
                                {
                                    scope.selected = false;
                                    tabsCtrl.addTab(scope, scope.index);

                                }
                            else
                                {
                                    tabsCtrl.removeTab(scope, scope.index);
                                }
                        })
                    }
            };
        });

    })
();
