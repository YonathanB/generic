/***********************************************
 * File Name: kProgress.js
 * Created by: Chezi Hoyzer
 * On: 21/09/2014  14:23
 * Last Modified: 21/04/2015
 * Modified by: Fassous
 ***********************************************/
(function () {
    angular.module('components.widgets').directive("kProgress", function () {
        return {
            restrict: 'E',
            scope: {
                progressval: '=',
                controlClass: '@',
                backtozero: "=",
                showNumber: "=",
                visible:'=',
                orientation:'@'
            },
            template: "" +
            "<div ng-show='visible' class='kProgress {{controlClass}}' ng-class='{\"progress-vertical\":orientation==\"V\"}'>" +
                "<div ng-if='orientation!=\"V\"' ng-attr-style='width: {{progressval || 0}}%;'></div>" +
                "<div ng-if='orientation==\"V\"' ng-attr-style='height: {{progressval || 0}}%;'></div>" +
                "<span ng-show='showNumber' class='kProgress-number' >{{progressval || 0}} %</span>" +
            "</div>",
            compile: function (element, attrs) {
                if (!attrs.progressval) {
                    attrs.progressval = 0;
                }
                if (!attrs.backtozero) {
                    attrs.backtozero = "true";
                }
                if (!attrs.controlClass) {
                    attrs.controlClass = "";
                }
                if (!attrs.showNumber) {
                    attrs.showNumber = "false";
                }
                if (!attrs.visible) {
                    attrs.visible="true";
                }
                if (!attrs.orientation) {
                    attrs.orientation="H";
                }
                //the Link function
                return this.link;
            },
            link: function (scope, el, attrs) {
                scope.$watch('progressval', function (val) {
                    if (val >= 100)
                        if (utils.isTrue(scope.backtozero))
                            scope.progressval = 0;
                        else
                            scope.progressval = 100;
                });
            }
        };
    });
})();