/***********************************************
 * File Name: kCollapse.js
 * Created by: fassous
 * On: 14/03/2017 17:34
 * Last Modified:
 * Modified by:
 ***********************************************/

(function () {
    angular.module('components.widgets').directive("kCollapses", ['$parse', '$timeout', '$log', function ($parse, $timeout, $log) {
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                controlClass: '@',
                enabled: '=',
                header: '@',
                isOpen: '=',
                showArrow: '=',
                title: '@',
                visible: '=',
                onlyOne: '='
            },
            template: "<div ng-show='visible' class='kCollapses  {{controlClass}}' ng-class='{disabled:!enabled}' ng-transclude></div>",
            compile: function (element, attrs) {
                if (!attrs.enabled) {
                    attrs.enabled = "true";
                }
                if (!attrs.visible) {
                    attrs.visible = "true";
                }
                if (!attrs.isOpen) {
                    attrs.isOpen = "false";
                }
                if (!attrs.showArrow) {
                    attrs.showArrow = "true";
                }
                if (!attrs.onlyOne) {
                    attrs.onlyOne = "false";
                }
            },
            controller: function ($scope) {
                $scope.collapse = [];

                this.toggle = function (collapse) {
                    if ($scope.onlyOne)
                        angular.forEach($scope.collapse, function (value, key) {
                            value.isOpen = false;
                        });
                    collapse.isOpen = !collapse.isOpen;
                };

                this.addElement = function (element) {
                    $scope.collapse.push(element);
                }


            }
        };
    }]);

    angular.module('components.widgets').directive("kCollapse", ['$parse', '$timeout', '$log','$animateCss', function ($parse, $timeout, $log , $animateCss) {
        return {
            require: '^kCollapses',
            restrict: 'E',
            transclude: true,
            scope: {

                controlClass: '@',
                enabled: '=',
                header: '@',
                isOpen: '=',
                showArrow: '=',
                title: '@',
                visible: '=',
                isActive:'=',
                click: '&'

            },
            template: "<div ng-click='enabled && click()' ng-show='visible' class='kCollapse  {{controlClass}}' ng-class='{disabled:!enabled,active:isActive}' title='{{title}}'>" +
            "    <div class='kCollapse-title' ng-click='enabled && toggle($this)'>" +
            "        <div ng-if='showArrow' class='kCollapse-arrow' ng-class='{open:isOpen , close:!isOpen}'></div>" +
            "        <div class='kCollapse-title-text' ng-bind-html='header | safehtml '></div>" +
            "    </div>" +
            "    <div class='kCollapse-content-container'>" +
            "        <div class='kCollapse-content' ng-class='{Zclosed:!isOpen,Zopened:isOpen}' ng-transclude></div>" +
            "    </div>" +
            "</div>",
            compile: function (element, attrs) {
                if (!attrs.enabled) {
                    attrs.enabled = "true";
                }
                if (!attrs.visible) {
                    attrs.visible = "true";
                }
                if (!attrs.isOpen) {
                    attrs.isOpen = "false";
                }
                if (!attrs.showArrow) {
                    attrs.showArrow = "true";
                }
                return this.link;
            },
            link: function (scope, element, attrs, collapsesCtrl) {


                var contentBoxContainer = angular.element( element[0].getElementsByClassName("kCollapse-content-container")[0]);
                var contentBox          = element[0].getElementsByClassName("kCollapse-content")[0];
                var kCollapseTransitionTime = 100;


                scope.$watch("isOpen", function (nv, ov) {
                    if (utils.isTrue(nv)) {
                        var animator = $animateCss(contentBoxContainer, {
                            from: { height:'5px' },
                            to: { height: contentBox.scrollHeight.toString() + "px" },
                            addClass: "opened",
                            removeClass: "closed",
                            duration:0.35,
                            cleanupStyles:true

                        });
                        // animator.start();
                        animator.start().done(function(){
                            contentBoxContainer[0].style.height = "auto";
                        });
                    }
                    else {
                        var animator = $animateCss(contentBoxContainer, {
                            from: { height: contentBox.scrollHeight.toString() + "px" },
                            to: { height:'0' },
                            addClass: "closed",
                            removeClass: "opened",
                            duration:0.35,
                            cleanupStyles:true
                        });
                        animator.start();
                    }
                });

                collapsesCtrl.addElement(scope);

                scope.toggle = function () {
                    collapsesCtrl.toggle(this);
                };
            }
        };
    }]);
})();


