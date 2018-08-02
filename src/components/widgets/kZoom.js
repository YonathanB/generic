/***********************************************
 * File Name: kZoom.js
 * Created by: fassous
 * On: 02/09/2015 15:11
 * Last Modified:
 * Modified by:
 ***********************************************/
(function () {
    angular.module('components.widgets').directive("kZoom", ['$timeout', '$interval', function ($timeout, $interval) {
        return {
            restrict: 'E',
            scope: {
                affectedClass: '@',
                affectedClassFirefox: '@',
                max: '@',
                min: '@',
                controlClass: '@',
                enabled: '=',
                value: '=',
                title: '@'
            },
            templateOLD: "" +
            "<div class='kZoom {{controlClass}}' ng-class='{disabled : !enabled }'>" +
            "   <div class='kZoom-title'>{{title}}</div>" +
            "   <div class='kZoom-button' ng-click='value=value-10' title='Click here for zoom out'>-</div>" +
            "   <div class='kZoom-value' ng-dblclick='value=100' title='Double Click here to reset zoom value'>{{value}}%</div>" +
            "   <div class='kZoom-button' ng-click='value=value+10' title='Click here for zoom in'>+</div>" +
            "</div>",
            template: '' +
            "<div class='kZoom {{controlClass}}' ng-class='{disabled : !enabled }'>" +
            "   <div class='kZoom-title'>{{title}}</div>" +
            '   <k-slider ' +
            '       min= "10" ' +
            '       max= "600" ' +
            '       init-val= "{{value}}" ' +
            '       control-class= "" ' +
            '       show-input="true" ' +
            '       show-arrows="true" ' +
            '       show-progress="false" ' +
            '       show-zero="false" ' +
            '       show-min-max="false" ' +
            '       show-input-arrows="false" ' +
            '       orientation= "H" ' +
            '       value= "value" ' +
            '       unit= "%" ' +
            '       click-steps= "10" ' +
            '       timeout= "500" ' +
            '       ctrl-click-value="100"></k-slider>' +
            "</div>",
            compile: function (element, attrs) {
                if (!attrs.enabled)
                    attrs.enabled = "true";
                if (!attrs.min)
                    attrs.min = 10;
                if (!attrs.max)
                    attrs.max = 600;
                if (!attrs.value)
                    attrs.value = 100;
                if (!attrs.valueToListen)
                    attrs.valueToListen = 0;
                if (!attrs.controlClass)
                    attrs.controlClass = "";
                if (!attrs.affectedClass)
                    attrs.affectedClass = "";
                if (!attrs.affectedClassFirefox)
                    attrs.affectedClassFirefox = "";
                if (!attrs.title)
                    attrs.title = "";
                return this.link;
            },
            link: function (scope, element, attrs) {

                scope.$watch('value', function (nv, ov) {
                    nv = parseInt(nv)
                    nv = Math.min(scope.max, nv);
                    nv = Math.max(scope.min, nv);

                    //todo min max

                    var objs = null;

                    if (scope.affectedClass != "") {
                        objs = document.getElementsByClassName(scope.affectedClass);
                        for (var i = 0, len = objs.length; i < len; i++) {
                            objs[i].style.zoom = nv / 100;
                        }
                    }

                    if (scope.affectedClassFirefox != "") {
                        objs = document.getElementsByClassName(scope.affectedClassFirefox);
                        for (var i = 0, len = objs.length; i < len; i++) {
                            objs[i].style.MozTransform = 'scale(' + nv / 100 + ')';
                        }
                    }

                });


            }
        };
    }]);
})();