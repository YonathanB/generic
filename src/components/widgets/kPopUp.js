/**
 * Created by Choyzer on 02/12/2014.
 */
/***********************************************
 * File Name: kPopUp.js
 * Created by: Chezi Hoyzer
 * On: 02/12/2014  12:48
 * Last Modified: 02/12/2014
 * Modified by: Choyzer
 ***********************************************/


(function ()
    {
        angular.module('components.widgets').directive("kPopUp", ['$timeout', function ($timeout)
            {
                return {
                    restrict: 'E',
                    transclude: true,
                    scope: {
                        visible: '=',
                        onClose: '&',
                        controlClass: '@',
                        popUpNgClass: "=",
                        controlStyle: '@',
                        showCloseButton: '=',
                        allowDrag: '=',
                        autoAdjust:"=",
                        timeout:"@"
                    },
                    template: '<div k-drag-and-drop="true"\
                                    dad-is-draggable="allowDrag"\
                                    dad-is-drop-target="false"\
                                    dad-on-drag-start=""\
                                    ng-click="updatepopUpClicked()" ng-if="visible" class="popUpControl animate-popup" ng-class="controlClass" ng-attr-style="{{controlStyle}}">\
                                    <div>\
                                        <div ng-if="showCloseButton==true" class="kPopUpCloseButton" ng-click="close()"></div>\
                                        <div ng-transclude></div>\
                                    </div>\
                               </div>',
                    compile: function (element, attrs)
                        {
                            if (!attrs.showCloseButton){
                                    attrs.showCloseButton = "true";
                                    }
                            if (!attrs.allowDrag){
                                attrs.allowDrag = "true";
                                }
                            if (!attrs.autoAdjust){
                                attrs.autoAdjust = "false";
                                }
                            if (!attrs.timeout && attrs.timeout!="0"){
                                attrs.timeout = "150";
                                }

                            return this.link;
                        },
                    link: function (scope, element, attrs)
                        {

                            scope.close = function ()
                                {
                                    scope.visible = false;
                                    scope.onClose();
                                };

                            var windowClick = function (event)
                                {
                                    if (!popUpClicked && scope.visible && clickNotCauseFromVisibleChange)
                                        {
                                            scope.visible = false;
                                            scope.onClose();
                                            scope.$apply();
                                        }
                                    popUpClicked = false;
                                };

                            var elementClick = function (event)
                                {
                                    popUpClicked = true;
                                };

                            var dynamicClasses = [];
                            var popUpClicked = false;
                            var clickNotCauseFromVisibleChange = false;
                            window.document.addEventListener('click', windowClick);
                            window.document.addEventListener('contextmenu', windowClick);
                            window.document.addEventListener('touchstart', windowClick);
                            angular.element(element[0])[0].addEventListener('click', elementClick);
                            angular.element(element[0])[0].addEventListener('contextmenu', elementClick);
                            angular.element(element[0])[0].addEventListener('touchstart', elementClick);

                            scope.$watch('popUpNgClass', function (newVal)
                            {
                                for (var newClass in newVal)
                                    {
                                        if (newVal[newClass] === true)
                                            {
                                                dynamicClasses.push(newClass);
                                            }
                                    }
                            });

                            scope.$watch('visible', function (newVal)
                            {
                                if (newVal)
                                    {
                                        for (var i = 0; i < dynamicClasses.length; i++)
                                            {
                                                angular.element(element[0].children[0]).addClass(dynamicClasses[i]);
                                            }
                                        clickNotCauseFromVisibleChange = false;
                                        $timeout(function ()
                                        {
                                            if(scope.autoAdjust){
                                                var obj = element[0].children[0];
                                                var position = obj.getBoundingClientRect();
                                                console.log(position);
                                                if(position.bottom > window.innerHeight){
                                                    //obj.style.top = (window.innerHeight - position.height) + "px";
                                                    obj.style.top = "auto";
                                                    obj.style.bottom = "10px";
                                                }
                                                if(position.right > window.innerWidth){
                                                    //obj.style.left = (window.innerWidth - position.width) + "px";
                                                    obj.style.left = "auto";
                                                    obj.style.right = "10px";
                                                }
                                                console.log(obj.getBoundingClientRect());

                                            }
                                            clickNotCauseFromVisibleChange = true;
                                        }, scope.timeout)
                                    }
                            })


                        }

                };
            }]);
    })();
