/***********************************************
 * File Name: kVerticalSlider.js
 * Created by: Chezi Hoyzer
 * On: 21/09/2014  12:43
 * Last Modified: 21/09/2014
 * Modified by: Choyzer
 ***************************************/

(function ()
    {
        angular.module('components.widgets').directive("kVerticalSlider", function ()
        {
            return {
                restrict: 'E',
                transclude: true,
                scope: {
                    //k-vertical-slider-core

                    sliderInitVal: '@',
                    timeout: '@',
                    listenOnMove: '@',
                    enableSliderOnMute: '@',
                    enableSliderOnChange: '@',
                    enabled: '=',
                    width: '@',
                    height: '@',
                    max: '@',
                    min: '@',
                    unit: '@',
                    // titleText: '@',
                    backgroundColorClass: '@',
                    knoobActiveColorClass: '@',
                    knoobDisableColorClass: '@',
                    knoobIconsBigClass: '@',
                    knoobIconsMedClass: '@',
                    knoobIconsSmallClass: '@',
                    sliderControlClass: '@',
                    onValueToListenChanged: '&', // must use like this: setClickFunctionName(insideVal) for deliver the value into the function
                    onValueChanged: '&', // must use like this: setClickFunctionName(insideVal) for deliver the value into the function
                    //k-state-button
                    mutedInitVal: '@',
                    iconState: '@',
                    stateControlClass: '@',
                    iconDisableState: '=?',
                    iconStates: '=?',
                    onStateChanged: '&',// must use like this: setClickFunctionName(insideVal) for deliver the mute status into the function
                    //k-up-down
                    controlInputClass: '@'
                },
                template: "<div class='table kVerticalSlider' >\
                             <div class='tableRow'>\
                                    <div class='tableCell'>\
                                      <div ng-transclude>\
                                      </div>\
                                    </div>\
                             </div>\
                             <div class='tableRow'>\
                                    <div class='tableCell'>\
                                      <div class='betweenControlSliderCore'>\
                                         <k-vertical-slider-core control-class='{{sliderControlClass}}' background-color-class='{{backgroundColorClass}}' knoob-active-color-class='{{knoobActiveColorClass}}' knoob-disable-color-class='{{knoobDisableColorClass}}' knoob-icons-big-class='{{knoobIconsBigClass}}' knoob-icons-med-class='{{knoobIconsMedClass}}' knoob-icons-small-class='{{knoobIconsSmallClass}}' enabled='enabled && ( !muted || enableSliderOnMute)'  value='value' valuetolisten='valuetolisten' listen-on-move='{{listenOnMove}}' width='{{width/2}}' height='{{height}}' max='{{max}}' min='{{min}}' timeout='{{timeout}}'></k-vertical-slider-core>\
                                      </div>\
                                    </div>\
                             </div>\
                             <div class='tableRow'>\
                                    <div class='tableCell'>\
                                      <div class='betweenControlUpDown'>\
                                         <k-up-down-range  init-val='{{sliderInitVal}}' control-class='vSliderUpDown {{controlInputClass}}' control-input-class='vSliderUpDown {{controlInputClass}}'  unit='{{unit}}'  enabled='enabled && ( !muted || enableSliderOnMute )' max='{{max}}' min='{{min}}' value='value' value-to-listen='valuetolisten' timeout='{{timeout}}'></k-up-down-range>\
                                      </div>\
                                    </div>\
                             </div>\
                             <div class='tableRow'>\
                                    <div class='tableCell'>\
                                      <div class='betweenControlState'>\
                                       <k-state-button state-control-class='{{stateControlClass}}' onaction='iconOnAction()' enabled='enabled' states='iconStates' state='{{iconState}}' disabledstate='iconDisableState'></k-state-button>\
                                      </div>\
                                   </div>\
                             </div>\
                           </div>",
                compile: function (element, attrs)
                    {
                        //k-vertical-slider-core

                        if (!attrs.timeout)
                            { attrs.timeout = 500; }
                        if (!attrs.listenOnMove)
                            { attrs.listenOnMove = "true"; }
                        if (!attrs.enabled)
                            { attrs.enabled = "true" }

                        if (!attrs.enableSliderOnMute)
                            { attrs.enableSliderOnMute = false }
                        if (!attrs.enableSliderOnChange)
                            { attrs.enableSliderOnChange = false }

                        if (!attrs.width)
                            { attrs.width = 50 }
                        if (!attrs.height)
                            { attrs.height = 310 }
                        if (!attrs.max)
                            { attrs.max = 100 }
                        if (!attrs.min)
                            { attrs.min = 0 }
                        if (!attrs.unit)
                            { attrs.unit = "db" }
                        if (!attrs.value)
                            { attrs.value = 20; }
                        if (!attrs.knoobActiveColorClass)
                            { attrs.knoobActiveColorClass = "app-main-background-color" }
                        if (!attrs.knoobDisableColorClass)
                            { attrs.knoobDisableColorClass = "app-disable-background-color" }
                        if (!attrs.backgroundColorClass)
                            { attrs.backgroundColorClass = "app-secondary-background-color" }
                        if (!attrs.titleText)
                            { attrs.titleText = "Volume" }
                        if (!attrs.knoobIconsBigClass)
                            { attrs.knoobIconsBigClass = "icon_knoob" }
                        if (!attrs.knoobIconsMedClass)
                            { attrs.knoobIconsMedClass = "icon_knoob" }
                        if (!attrs.knoobIconsSmallClass)
                            { attrs.knoobIconsSmallClass = "icon_knoob" }
                        if (!attrs.sliderControlClass)
                            { attrs.sliderControlClass = "horizontalCenter" }
                        //k-state-button
                        if (!attrs.iconState)
                            { attrs.iconState = 0 }
                        if (!attrs.stateControlClass)
                            { attrs.stateControlClass = "horizontalCenter" }

                        //k-up-down
                        if (!attrs.controlInputClass)
                            { attrs.controlInputClass = "k-vertical-input-style" }
                        return this.link;
                    },
                link: function (scope, element, attrs)
                    {


                        scope.$watch("valuetolisten", function (nv)
                        {
                            if (angular.isDefined(nv))
                                {
                                    scope.onValueToListenChanged({insideVal: nv});
                                }
                        });

                        scope.$watch("value", function (nv)
                        {
                            if (angular.isDefined(nv))
                                {
                                    scope.onValueChanged({insideVal: nv});
                                }
                        });

                        scope.$watch('sliderInitVal', function (nv)
                        {
                            if (angular.isDefined(nv))
                                {
                                    scope.value = parseInt(nv);

                                    if (utils.isTrue(scope.enableSliderOnChange))
                                        {
                                            scope.muted = false;
                                        }
                                }
                        });

                        scope.$watch('mutedInitVal', function (nv)
                        {
                            if (angular.isDefined(nv))
                                {
                                    scope.muted = utils.isTrue(nv);
                                }
                        });


                        if (!scope.iconStates)
                            {
                                scope.iconStates = scope.iconStates = [];
                                scope.iconStates.push({iconClass: "icon_muteOFF", title: "Click to mute"});
                                scope.iconStates.push({iconClass: "icon_muteON", title: "Click to unmute"});
                            }
                        scope.$watch("muted", function ()
                        {
                            if (scope.muted)
                                {
                                    scope.iconState = 1;
                                }
                            else
                                {
                                    scope.iconState = 0;
                                }
                        });

                        if (!scope.iconDisableState)
                            {
                                scope.iconDisableState = {iconClass: "icon_muteDisabled", title: "Control is disabled"};
                            }


                        scope.iconOnAction = function ()
                            {
                                scope.muted = !scope.muted;

                                scope.onStateChanged({insideVal: scope.muted});
                            }
                    }
            };
        });
    })();
