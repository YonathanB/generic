/***********************************************
 * File Name: kExpandable.js
 * Created by: fassous
 * On: 23/06/2015 15:39
 * Last Modified:
 * Modified by:
 ***********************************************/

(function () {
    angular.module('components.widgets').directive("kExpandable", ['$timeout','$animate', function ($timeout,$animate) {
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                title: '@',
                isOpened: '=',
                enabled: '=',
                visible: '=',
                controlClass: '@',
                firstLaunch:'@',
                direction:'@'//Top,Bottom,Left,Right
            },
            template: '\
            <div class="kExpandable {{controlClass}}" ng-class="{\'is-opened\':(firstLaunch && isOpened) , \'is-closed\': (firstLaunch && !isOpened )}"> \
                <div class="kExpandable-title" ng-click="internalClick()" >{{title}}<div class="kExpandable-button"></div></div>\
                <div ng-show="true || isOpened" class="kExpandable-content" ng-transclude></div>\
            </div>',
            compile: function (element, attrs) {
                if (!attrs.title)
                    attrs.title = "title";
                if (!attrs.isOpened)
                    attrs.isOpened = "true";
                if (!attrs.visible)
                    attrs.visible = "true";
                if (!attrs.enabled)
                    attrs.enabled = "true";
                if (!attrs.controlClass)
                    attrs.controlClass = "";
                attrs.firstLaunch ="true";
                return this.link;
            },
            link: function (scope, element, attrs) {



                var internalCollapseExpand = function () {
                    scope.firstLaunch =false;
                    objContent = element.find('.kExpandable-content')[0];
                    objButton = element.find('.kExpandable-button')[0];
                    objContent.style.maxHeight = "none";

                    coordinates = objContent.getBoundingClientRect();
                    if (scope.isOpened) {
                        //objContent.style.marginBottom = '0px';
                        objContent.style.maxHeight = '0px';
                        objButton.classList.add('open');
                        $timeout(function ()
                        {
                            objContent.style.maxHeight = coordinates.height + 'px';
                        },100);
                    }
                    else {
                        objContent.style.maxHeight = coordinates.height + 'px';
                        objButton.classList.remove('open');
                        $timeout(function ()
                        {
                            objContent.style.maxHeight = '0px';
                        },100);
                    }

                }
                scope.internalClick = function () {
                    scope.isOpened = !scope.isOpened;
                    internalCollapseExpand();

                };

            }
        };
    }]);
})();


