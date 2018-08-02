/**
 * Created by Choyzer on 02/10/2014.
 */
/***********************************************
 * File Name: kButton.js
 * Created by: Chezi Hoyzer
 * On: 02/10/2014  09:21
 * Last Modified: 15/04/2015
 * Modified by: Fassous
 ***********************************************/
(function () {
    angular.module('components.widgets').directive("kButton", function () {
        return {
            restrict: 'E',
            scope: {
                text: '@',
                controlClass: '@',
                enabled: '=',
                visible: '=',
                title: '@',
                click: '&'
            },
            templateOLD: "<div ng-show='visible' title='{{title}}' ng-click='enabled && click()' ng-class='{disabled : !enabled }' class='kButton  {{controlClass}}'  >{{text}}</div>",
            template: "<input type='button' ng-show='visible' ng-disabled='!enabled' title='{{title}}' ng-click='enabled && click()' ng-class='{disabled : !enabled }' class='kButton {{controlClass}} btn default' value='{{text}}' />",

            compile: function (element, attrs) {
                if (!attrs.text) {
                    attrs.text = "Default text";
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
                if (!attrs.visible) {
                    attrs.visible = "true";
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
                scope.checkForClick = function () {
                    if (scope.enabled == true || scope.enabled == 'true') {
                        scope.click();
                    }
                }
            }
        };
    });
})();


