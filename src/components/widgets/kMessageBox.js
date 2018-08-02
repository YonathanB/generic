/**
 * Created by CHoyzer on 05/10/2014.
 */
/***********************************************
 * File Name: kMessageBox.js
 * Created by: Chezi Hoyzer
 * On: 05/10/2014  13:25
 * Last Modified: 05/10/2014
 * Modified by: CHoyzer
 ***********************************************/



(function ()
    {


        angular.module('components.widgets').directive("kMessageBox", function ()
        {
            return {
                restrict: 'E',
                transclude: true,
                scope: {
                    type: '@', //can be "error" "warning" "info" "success"
                    visible: '=',
                    titleText: '@',
                    middleClick: '&',
                    rightClick: '&',
                    onClose: '&',
                    cancelVisible: '=',
                    cancelEnabled: '=',
                    okEnabled: '=',
                    hideBackground: '=',
                    showButtonsSection: '=',
                    showTitleSection: '=',
                    isAnimate: '=',
                    showCloseButton: '=',
                    timeout: '@',
                    controlClass: '@'
                },

                template: "<k-dialog  show-shadow='true' control-class='kMessageBox {{controlClass}}' middle-enabled='okEnabled' middle-visible='true' is-animate='isAnimate' show-title-section='showTitleSection' show-buttons-section='showButtonsSection' visible=visible hide-background='hideBackground'  allow-drag='false' title-text='{{titleText}}' on-close='onCloseClick()' left-visible='false' middle-click='controlOkClick()' right-click='$event.stopPropagation();controlCancelClick()' right-enabled='cancelEnabled' right-visible='cancelVisible' show-close-button='showCloseButton' timeout='{{timeout}}'>\
                             <div class='kMessageBox-icon' ng-class='{\"icon_MBError\" : type == \"error\", \"icon_MBInfo\" : type == \"info\" , \"icon_MBwarning\" : type == \"warning\" , \"icon_MBSuccess\" : type == \"success\", \"icon_MBQuestion\" : type == \"question\"}'></div>\
                             <div class='kMessageBox-content'  ng-transclude></div>\
                          </k-dialog>",


                compile: function (element, attrs)
                    {
                        if (!attrs.type)
                            { attrs.type = "error"; }
                        if (!attrs.visible)
                            { attrs.visible = "false"; }
                        if (!attrs.hideBackground)
                            { attrs.hideBackground = "false"; }
                        if (!attrs.titleText)
                            { attrs.titleText = "TITLE HERE"; }
                        if (!attrs.middleClick)
                            {
                                attrs.middleClick = function ()
                                    {
                                        //console.log("middleClick")
                                    };
                            }
                        if (!attrs.rightClick)
                            {
                                attrs.rightClick = function ()
                                    {
                                        //console.log("rightClick")
                                    };
                            }
                        if (!attrs.cancelVisible)
                            { attrs.cancelVisible = "false"; }
                        if (!attrs.showButtonSection)
                            { attrs.showButtonSection = "true"; }
                        if (!attrs.cancelEnabled)
                            { attrs.cancelEnabled = "true"; }
                        if (!attrs.okEnabled)
                            { attrs.okEnabled = "true"; }
                        if (!attrs.hideBackground)
                            { attrs.hideBackground = "false"; }
                        if (!attrs.showTitleSection)
                            { attrs.showTitleSection = "true"; }
                        if (!attrs.isAnimate)
                            { attrs.isAnimate = "true"; }

                        return this.link;
                    },
                link: function (scope, el, attrs)
                    {

                        scope.controlOkClick = function ()
                            {
                                //scope.visible = false;
                                scope.middleClick();
                            };
                        scope.controlCancelClick = function ()
                            {
                                // scope.visible = false;
                                scope.rightClick();
                            };

                        scope.onCloseClick = function ()
                            {
                                scope.visible = false;
                                scope.onClose();
                            }


                    }
            };
        });
    })();