/***********************************************
 * File Name: kButtonIcon.js
 * Created by: Fabrice Assous
 * On: 03/03/2016
 * Last Modified:
 * Modified by:
 ***********************************************/
(function () {
    angular.module('components.widgets').directive("kButtonIcon", function () {
        return {
            restrict: 'E',
            scope: {
                controlClass: '@',
                enabled: '=',
                active: '=',
                visible: '=',
                title: '@',
                click: '&',
                iconClass: '@',
                iconActiveClass: '@',
                iconHoverClass: '@',
                iconDisabledClass: '@',
                stopPropagation:'='
            },
            template: '<div ' +
            'ng-if="visible" ' +
            'ng-disabled="!enabled" ' +
            'title=\'{{title}}\' ' +
            'ng-click="internalClick($event)" ' +
            'class=\' kButtonIcon {{controlClass}} {{ !enabled ? iconDisabledClass + " disabled " : active ? iconActiveClass : isHover ? iconHoverClass : iconClass}}\' ' +
            'ng-mouseenter="isHover = true" ' +
            'ng-mouseleave="isHover = false"' +
            '></div>',

            compile: function (element, attrs) {
                if (!attrs.text) {
                    attrs.text = "";
                }
                if (!attrs.controlClass) {
                    attrs.controlClass = "";
                }

                if (!attrs.title) {
                    attrs.title = "";
                }
                if (!attrs.enabled) {
                    attrs.enabled = "true";
                }
                if (!attrs.enabled) {
                    attrs.enabled = "false";
                }
                if (!attrs.visible) {
                    attrs.visible = "true";
                }
                if (!attrs.iconClass) {
                    attrs.iconClass = "";
                }
                if (!attrs.iconHoverClass) {
                    attrs.iconHoverClass = attrs.iconClass;
                }
                if (!attrs.iconActiveClass) {
                    attrs.iconActiveClass = attrs.iconClass;
                }
                if (!attrs.iconDisabledClass) {
                    attrs.iconDisabledClass = attrs.iconClass;
                }
                if (!attrs.stopPropagation) {
                    attrs.stopPropagation = "false";
                }

                //the Link function
                return this.link;
            },
            link: function (scope, element, attrs) {

                if (!scope.click) {
                    scope.click = function () {
                        alert("Not implement")
                    };
                }
                scope.internalClick = function(event){
                    if(scope.stopPropagation)
                        event.stopPropagation();
                    if(! scope.enabled)
                        return;
                    scope.click();
                };
            }
        };
    });
})();


