/***********************************************
 * File Name: kDialog.js
 * Created by: Chezi Hoyzer
 * On: 21/09/2014  12:44
 * Last Modified: 21/09/2014
 * Modified by: Choyzer
 ***********************************************/
import utils from '../../assets/js/utils';

(function () {


    angular.module('components.widgets')
        .directive("kDialog", function ($timeout, $interval) {
            return {
                restrict: 'E',
                transclude: true,
                scope: {
                    visible: '=',
                    titleText: '@',
                    leftButtonText: '@',
                    middleButtonText: '@',
                    rightButtonText: '@',
                    leftClick: '&',
                    middleClick: '&',
                    rightClick: '&',
                    onClose: '&',
                    leftVisible: '=',
                    middleVisible: '=',
                    rightVisible: '=',
                    leftEnabled: '=',
                    middleEnabled: '=',
                    rightEnabled: '=',
                    contentTemplateurl: '@',
                    allowDrag: '=',
                    showButtonsSection: '=',
                    showTitleSection: '=',
                    hideBackground: '=',
                    isAnimate: '=',
                    showShadow: '=',
                    controlClass: '@',
                    noBorder: '@',
                    showCloseButton: '=',
                    timeout: '@'
                },
                template: " <div class='kDialog  {{controlClass}}' ng-class='{noBorder: noBorder == \"true\" ,\"hide-background\":hideBackground,\"show-shadow\":showShadow,\"is-animate\":isAnimate}'>\
                            <div ng-if='visible' class='kDialogBack' ></div>\
                            <div ng-if='visible' class='flex-center-vertical-horizontal-screen'>\
                              <div ng-if='visible' k-draggable='{{allowDrag}}' class='kDialogBox' >\
                                    <div ng-if='showCloseButton==true' class='kDialogCloseButton' ng-click='closeDialog()'></div>\
                                    <div ng-if='showTitleSection == true' class='kDialogTitleArea' >\
                                       <div class='kDialogTitle'>{{titleText}}</div>\
                                    </div>\
						              <div class='kDialogContent' ng-if='contentTemplateurl != null'  ng-include='contentTemplateurl'>\
						              </div>\
                                      <div class='kDialogContent' ng-if='contentTemplateurl == null' ng-transclude>\
						              </div>\
                                 <div class='kDialogButtonsArea' ng-if='showButtonsSection == true' >\
                                     <k-button enabled='rightEnabled' visible='rightVisible' click='controlRightClick()' text='{{rightButtonText}}'  control-class='kDialogButton'></k-button>\
                                     <k-button enabled='middleEnabled' visible='middleVisible' click='controlMiddleClick()' text='{{middleButtonText}}'  control-class='kDialogButton'></k-button>\
                                     <k-button enabled='leftEnabled' visible='leftVisible' click='controlLeftClick()' text='{{leftButtonText}}'  control-class='kDialogButton'></k-button>\
                                 </div>\
						      </div>\
						    </div>\
                    </div>",
                compile: function (element, attrs) {
                    if (!attrs.contentTemplateurl) {
                        attrs.contentTemplateurl = null;
                    }
                    if (!attrs.allowDrag) {
                        attrs.allowDrag = true;
                    }
                    if (!attrs.showButtonsSection) {
                        attrs.showButtonsSection = "true";
                    }
                    if (!attrs.showTitleSection) {
                        attrs.showTitleSection = "true";
                    }
                    if (!attrs.hideBackground) {
                        attrs.hideBackground = false;
                    }

                    if (!attrs.titleText) {
                        attrs.titleText = "TITLE HERE";
                    }

                    if (!attrs.leftButtonText) {
                        attrs.leftButtonText = "Apply";
                    }
                    if (!attrs.middleButtonText) {
                        attrs.middleButtonText = "OK";
                    }
                    if (!attrs.rightButtonText) {
                        attrs.rightButtonText = "Cancel";
                    }

                    if (!attrs.noBorder) {
                        attrs.noBorder = false;
                    }

                    if (!attrs.leftClick) {
                        attrs.leftClick = function () {
                            //console.log("leftClickClick")
                        };
                    }
                    if (!attrs.middleClick) {
                        attrs.middleClick = function () {
//                                        console.log("middleClick")
                        };
                    }
                    if (!attrs.rightClick) {
                        attrs.rightClick = function () {
                            //                                      console.log("rightClick")
                        };
                    }

                    if (!attrs.leftVisible) {
                        attrs.leftVisible = "false";
                    }
                    if (!attrs.middleVisible) {
                        attrs.middleVisible = "true";
                    }
                    if (!attrs.rightVisible) {
                        attrs.rightVisible = "true";
                    }
                    if (!attrs.leftEnabled) {
                        attrs.leftEnabled = "false";
                    }
                    if (!attrs.middleEnabled) {
                        attrs.middleEnabled = "true";
                    }
                    if (!attrs.rightEnabled) {
                        attrs.rightEnabled = "true";
                    }
                    if (!attrs.isAnimate) {
                        attrs.isAnimate = "true";
                    }
                    if (!attrs.visible) {
                        attrs.visible = "false";
                    }
                    if (!attrs.showShadow) {
                        attrs.showShadow = "true";
                    }
                    if (!attrs.allowDrag) {
                        attrs.allowDrag = "false";
                    }
                    if (!attrs.showButtonsSection) {
                        attrs.showButtonsSection = "true";
                    }
                    if (!attrs.showTitleSection) {
                        attrs.showTitleSection = "true";
                    }
                    if (!attrs.hideBackground) {
                        attrs.hideBackground = "false";
                    }

                    return this.link;
                },
                link: function (scope, el, attrs) {
                    var borderColor = 'white';
                    var firstTime = true;
                    var animateTime = utils.isTrue(scope.isAnimate) ? 200 : 5;
                    scope.controlRightClick = function () {
                        // scope.visible = false;
                        scope.rightClick();
                    };
                    scope.controlMiddleClick = function () {
                        // scope.visible = false;
                        scope.middleClick();
                    };
                    scope.controlLeftClick = function () {
                        //scope.visible = false;
                        scope.leftClick();
                    };
                    scope.closeDialog = function () {
                        //scope.visible = false;
                        scope.visible = false;
                        scope.onClose();
                    };


                    scope.$watch('visible', function (newVal, oldVal) {

                        if (newVal) {

                            if (scope.timeout > 0)//close dialog box if timeout indicated
                            {
                                $timeout(function () {
                                    scope.visible = false;
                                }, scope.timeout);

                            }
                        }
                    });
                }
            };
        })
        .directive("kMessage", function ($timeout, MessageService) {

            var _runProcess = function(data){
                data.process();
            };

            return {
                restrict: 'E',
                // transclude: true,
                replace: true,
                template: '<div  ng-show="msgData" class="dialog-error dialog-box">' +
                ' <div class="dialog flip-in-x" ng-if="msgData">' +
                '<h4 class="error-box-title {{msgData.type}}">{{msgData.title}}</h4>' +
                '<div class="body"></div>' +
                '<div class="exception-buttons">' +
                '<button ng-repeat="(key, obj) in msgData.buttons" ' +
                'ng-click="closeWindow(obj.onClick)" ' +
                'class="btn flat" ng-class="{\'selected\': obj.isSelected}">{{obj.text}}</button>' +
               '</div>' +
                '</div>' +
                '</div>' ,
                scope: {
                    msgData: '=data'
                },
                link: function (scope, $elem, attrs) {
                    scope.$watch('msgData', function(){
                        if(angular.isDefined(scope.msgData) && scope.msgData){
                            if (angular.isDefined(scope.msgData.process))
                                _runProcess(scope.msgData);
                            // var toAppend = angular.element(scope.msgData.body);
                            $timeout(function () {
                                $elem.find('.body').append(scope.msgData.body);
                            }, 0)
                        }
                        else if(scope.msgData === null)
                            scope.msgData = undefined;
                    });
                    scope.closeWindow = function(callback){
                        scope.msgData = undefined;
                        callback();
                    }
                }
            };
        });


})();


