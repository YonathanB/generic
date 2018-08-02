/***********************************************
 * File Name: kSlider.js
 * Created by: Fabrice Assous
 * On: 18/03/2014  09:21
 * Last Modified: 23/03/2014
 * Modified by: Fassous
 ***********************************************/
(function () {
    angular.module('components.widgets').directive("kSlider", ['$timeout', function ($timeout) {

        return {
            restrict: 'E',
            scope: {
                clickSteps: '@',
                controlClass: '@',
                controlClassButton: '@',
                ctrlClickValue: '@',
                enabled: '=',
                enabledClickOnMax: '=',
                initVal: '@',
                insideCursor: '=',
                min: '@',
                max: '@',
                orientation: '@',
                onValueToListenChanged: '&', // must use like this: setClickFunctionName(insideVal) for deliver the value into the function
                onValueChanged: '&', // must use like this: setClickFunctionName(insideVal) for deliver the value into the function
                showInput: '=',
                showArrows: '=',
                showMinMax: '=',
                showZero: '=',
                showInputArrows: '=',
                showProgress: '=',
                showValue: '=',
                timeout: '@',
                titleSliderLine: "@",
                titleInput: "@",
                unit: '@',
                value: '=',
                valueToListen: '=',
                visible: '=',
                decimals: '@',
                roundingTo: '@',
                steps: '@',
                autoCorrectValue: '=',
                validateOnArrow: '=',
                validateOnBlur: '=',
                validateOnEnter: '='
            },
            template: '\
<div ng-show="visible" class="kSlider {{controlClass}}" ng-class="{\'disabled\':!enabled,\'slider-vertical\':orientation==\'V\'}">\
    <k-input ng-show="showInput && orientation!=\'V\'" show-input-arrows="showInputArrows" unit="{{unit}}" init-val="{{initVal}}" control-class="{{unit==\'\' ? \'\' : \'hasUnit\'}}" value-to-listen="valueToListen" enabled="enabled" max="{{max}}" min= "{{min}}" value="value" title="{{titleInput}}" decimals="{{decimals}}" rounding-to="{{roundingTo}}" steps="{{steps}}" validate-on-enter="validateOnEnter" validate-on-arrow="validateOnArrow" validate-on-blur="validateOnBlur" auto-correct-value="autoCorrectValue"></k-input>\
    <div ng-if="showValue && orientation!=\'V\'" class="slider-value">{{value.toFixed(decimals)}} {{unit}}</div>\
    <div ng-if="showArrows && orientation!=\'V\'" class="slider-left" ng-mousedown="arrowDownMouseDown();" ng-mouseup="arrowMouseUp();" ></div>\
    <div ng-if="showArrows && orientation==\'V\'" class="slider-up" ng-mousedown="arrowUpMouseDown();" ng-mouseup="arrowMouseUp();" ></div>\
    <div data-drop="true" class="slider-line" draggable="false" title="{{titleSliderLine}}">\
        <div ng-if="showMinMax || (showZero && min<0 && max>0)" class="slider-bars">\
            <div ng-if="showMinMax" class="slider-min-bar" ></div>\
            <div ng-if="showMinMax" class="slider-max-bar" ></div>\
            <div ng-if="showZero && min<0 && max>0" class="slider-zero-bar" ></div>\
        </div>\
        <div ng-if="showMinMax || (showZero  && min<0 && max>0)" class="slider-numbers">\
            <div ng-if="showMinMax" class="slider-min-value" ng-click="enabled && changeValue(min)" >{{min>0?"+":""}}{{min}}<span class="slider-unit">{{unit}}</span></div>\
            <div ng-if="showMinMax" class="slider-max-value" ng-click="enabled && (enabledClickOnMax || max==0) && changeValue(max)" ng-class="{\'slider-clickable\':enabled && (enabledClickOnMax || max==0)}">{{max>0?"+":""}}{{max}}<span class="slider-unit">{{unit}}</span></div>\
            <div ng-if="showZero  && min<0 && max>0" class="slider-zero-number" ng-click="enabled && changeValue(0)">{{orientation==\'V\' ? \'\' : \'\'}}0<span class="slider-unit">{{unit}}</span></div>\
        </div>\
        <k-progress ng-if="showProgress && orientation!=\'V\'" orientation="H" control-class="slider-progress" backtozero="false" progressval= "percentage" show-number="false" visible="true" ></k-progress>\
        <k-progress ng-if="showProgress && orientation==\'V\'" orientation="V" control-class="slider-progress" backtozero="false" progressval= "percentage" show-number="false" visible="true" ></k-progress>\
        <div data-drag="true" class="slider-button {{controlClassButton}}" draggable="false"></div>\
    </div>\
    <div ng-if="showArrows && orientation!=\'V\'" class="slider-right" ng-mousedown="arrowUpMouseDown();" ng-mouseup="arrowMouseUp();" ></div>\
    <div ng-if="showArrows && orientation==\'V\'" class="slider-down" ng-mousedown="arrowDownMouseDown();" ng-mouseup="arrowMouseUp();" ></div>\
    <k-input ng-show="showInput && orientation==\'V\'"  show-input-arrows="showInputArrows" unit="{{unit}}" init-val="{{initVal}}" control-class="{{unit==\'\' ? \'\' : \'hasUnit\'}}" value-to-listen="valueToListen" enabled="enabled" max="{{max}}" min="{{min}}" value="value" title="{{titleInput}}" decimals="{{decimals}}" rounding-to="{{roundingTo}}" steps="{{steps}}" validate-on-enter="validateOnEnter" validate-on-arrow="validateOnArrow" validate-on-blur="validateOnBlur" auto-correct-value="autoCorrectValue"></k-input>\
    <div ng-if="showValue && orientation==\'V\'" class="slider-value">{{value.toFixed(decimals)}} {{unit}}</div>\
</div>',
            compile: function (element, attrs) {
                if (!attrs.max) {
                    attrs.max = 100;
                }
                if (!attrs.min) {
                    attrs.min = 0;
                }
                if (!attrs.visible) {
                    attrs.visible = "true";
                }
                if (!attrs.enabled) {
                    attrs.enabled = "true";
                }
                if (!attrs.enabledClickOnMax) {
                    attrs.enabledClickOnMax = "true";
                }
                if (!attrs.orientation) {
                    attrs.orientation = "H";
                }//horizontal
                if (!attrs.showInput) {
                    attrs.showInput = "true";
                }
                if (!attrs.showArrows) {
                    attrs.showArrows = "true";
                }
                if (!attrs.showMinMax) {
                    attrs.showMinMax = "true";
                }
                if (!attrs.showZero) {
                    attrs.showZero = "true";
                }
                if (!attrs.showInputArrows) {
                    attrs.showInputArrows = "false";
                }
                if (!attrs.showProgress) {
                    attrs.showProgress = "false";
                }
                if (!attrs.showValue) {
                    attrs.showValue = "false";
                }
                if (!attrs.unit) {
                    attrs.unit = "";
                }
                if (!attrs.clickSteps) {
                    attrs.clickSteps = "0";
                }
                if (!attrs.insideCursor) {
                    attrs.insideCursor = "false";
                }
                if (!attrs.timeout) {
                    attrs.timeout = "500";
                }
                if (!attrs.ctrlClickValue) {
                    attrs.ctrlClickValue = "0";
                }
                if (!attrs.decimals) {
                    attrs.decimals = "0";
                }
                if (!attrs.roundingTo) {
                    attrs.roundingTo = "0";
                }
                if (!attrs.steps) {
                    attrs.steps = "1";
                }
                if (!attrs.autoCorrectValue) {
                    attrs.autoCorrectValue = "false";
                }
                if (!attrs.validateOnArrow) {
                    attrs.validateOnArrow = "false";
                }
                if (!attrs.validateOnBlur   ) {
                    attrs.validateOnBlur = "false";
                }
                if (!attrs.validateOnEnter) {
                    attrs.validateOnEnter = "false";
                }

                return this.link;
            },
            link: function (scope, element, attrs) {
                var objButton = null;
                var objLine = null;
                var objSlider = null;
                var objZeroBar = null;
                var objZeroNumber = null;
                var intervalObj = null;
                var isMouseDown = false;
                scope.current_element = element;
                // var isInternal = {"value": false};
                var flags={"isInternal":false , isInitialized:false};
                //For arrow click
                var bigstep = Math.round((scope.max - scope.min) / 100);
                //                console.log('bigstep:' + bigstep + '[ min: ' + scope.min + ' max:' + scope.max + ']');
                var isInitFinish = false;
                var timerArrowInterval = 256;
                var timerArrowIntervalMin = 16;

                var intervalObjArrow = null;
                var steps = 5;

                //var intervalAffectValue = 500;

                var init = function () {
                    //console.log("kslider.init()");
                    objButton = element.find('.slider-button')[0];
                    objLine = element.find('.slider-line')[0];
                    objSlider = element.find('.kSlider')[0];
                    objZeroBar = element.find('.slider-zero-bar')[0];
                    objZeroNumber = element.find('.slider-zero-number')[0];

                    // scope.value = scope.initVal;

                    validateValue(round(parseFloat(scope.initVal), scope.roundingTo));
                    // validateValue(scope.initVal);

                    if(!flags.isInitialized ){
                        bindElementMove();
                        element[0].addEventListener('mousewheel', function (event) {
                            mouseWheel(event);
                        });
                    }

                    placeZero();
                    flags.isInitialized = true;

                };

                $timeout(init, 0);
                $timeout(init, 1000);//double the init() call for bug on placeZero

                var validateValue = function (v) {
                    //console.log("kslider.validateValue("+ v + ")");
                    if (v === "-" || v === "") {
                        return;
                    }
                    else {
                        v = parseFloat(parseFloat(v).toFixed(scope.decimals));
                    }
                    v = Math.min(v, attrs.max);
                    v = Math.max(v, attrs.min);
                    moveCursor(ValueToPosition(v));
                    if (scope.value != v) {
                        flags.isInternal = true;
                        scope.value = v;
                    }
//                    console.log('value changed, new value is: ' + v);
                };

                scope.$watch('initVal', function (nv) {
                    //console.log("kslider.watch.initVal("+ nv + ")");
                    if (!isMouseDown) {
                        scope.internalInitVal = nv;
                        validateValue(nv);
                    }
                });

                var mouseWheel = function (event) {
                    //console.log("kslider.mousewheel()");
                    event.preventDefault();
                    if (!scope.enabled)
                        return;
                    var event = window.event || event; // old IE support
                    var delta = 0;
                    var newValue;
                    //var delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
                    if (event.wheelDelta) {
                        delta = parseInt((event.wheelDelta ) / 120);
                    }
                    else {
                        delta = parseInt(-event.detail / 7);
                    }
                    //                                    console.log(delta + ' - ' + event.wheelDelta +' - ' + event.detail );
                    flags.isInternal = true;
                    newValue = scope.value + (delta * scope.steps);

                    scope.$apply(function () {
                        scope.value = newValue;
                        validateValue(newValue);
                        affectValue();
                    });
                };

                var moveCursor = function (value) {
                    //console.log("kslider.moveCursor");
                    //obj = element.getElementsByClassName('onMove')[0];
                    obj = element.find('.slider-button')[0];
                    if (attrs.orientation == 'V') {
                        obj.style.bottom = value + 'px';
                    }
                    else {
                        obj.style.left = value + 'px';
                    }
                };

                var ValueToPositionPercentage = function (value, objButton) {
                    if (objButton == null) {
                        objButton = element.find('.slider-button')[0];
                    }
                    objLine = element.find('.slider-line')[0];
                    var valueToReturn;
                    if (scope.insideCursor) {
                        if (attrs.orientation == 'V') {
                            step = (objLine.offsetHeight - objButton.offsetHeight) / (attrs.max - attrs.min);
                            valueToReturn = ( (value - parseFloat(attrs.min)) * step);
                        }
                        else {
                            step = (objLine.offsetWidth - objButton.offsetWidth) / (attrs.max - attrs.min);
                            valueToReturn = ( (value - parseFloat(attrs.min)) * step);
                        }
                    }
                    else {//New version
                        if (attrs.orientation == 'V') {
                            // step = (objLine.offsetHeight ) / (attrs.max - attrs.min);
                            // return ( (value - parseFloat(attrs.min)) * step - objButton.offsetHeight / 2);
                            valueToReturn = (value - parseFloat(attrs.min)) / (parseFloat(attrs.max) - parseFloat(attrs.min));
                        }
                        else {
                            // step = (objLine.offsetWidth ) / (attrs.max - attrs.min);
                            // return ( (value - parseFloat(attrs.min)) * step - objButton.offsetWidth / 2);
                            valueToReturn = (value - parseFloat(attrs.min)) / (parseFloat(attrs.max) - parseFloat(attrs.min));
                        }

                    }
                    return valueToReturn * 100;
                };

                var ValueToPosition = function (value, objButton) {
                    if (objButton == null) {
                        objButton = element.find('.slider-button')[0];
                    }
                    objLine = element.find('.slider-line')[0];
                    var valueToReturn;
                    if (scope.insideCursor) {
                        if (attrs.orientation == 'V') {
                            step = (objLine.offsetHeight - objButton.offsetHeight) / (attrs.max - attrs.min);
                            valueToReturn = ( (value - parseFloat(attrs.min)) * step);
                        }
                        else {
                            step = (objLine.offsetWidth - objButton.offsetWidth) / (attrs.max - attrs.min);
                            valueToReturn = ( (value - parseFloat(attrs.min)) * step);
                        }
                    }
                    else {//New version
                        if (attrs.orientation == 'V') {
                            // step = (objLine.offsetHeight ) / (attrs.max - attrs.min);
                            // return ( (value - parseFloat(attrs.min)) * step - objButton.offsetHeight / 2);
                            valueToReturn = (value - parseFloat(attrs.min)) / (parseFloat(attrs.max) - parseFloat(attrs.min)) * objLine.offsetHeight - objButton.offsetHeight / 2;
                        }
                        else {
                            // step = (objLine.offsetWidth ) / (attrs.max - attrs.min);
                            // return ( (value - parseFloat(attrs.min)) * step - objButton.offsetWidth / 2);
                            valueToReturn = (value - parseFloat(attrs.min)) / (parseFloat(attrs.max) - parseFloat(attrs.min)) * objLine.offsetWidth - objButton.offsetWidth / 2;
                        }

                    }
                    return valueToReturn;
                };

                var positionToValue = function (position) {
                    var valueToReturn;
                    if (attrs.orientation == 'V') {
                        // valueToReturn = parseFloat(attrs.min) + (position + objButton.offsetHeight / 2) * (parseFloat(attrs.max) - parseFloat(attrs.min)) / (objLine.offsetHeight + objButton.offsetHeight)
                        valueToReturn = parseFloat(attrs.min) + (position / objLine.offsetHeight) * ( parseFloat(attrs.max) - parseFloat(attrs.min) );

                    }
                    else {
                        // valueToReturn = parseFloat(attrs.min) + (position + objButton.offsetWidth / 2) * (parseFloat(attrs.max) - parseFloat(attrs.min)) / (objLine.offsetWidth + objButton.offsetWidth)
                        valueToReturn = parseFloat(attrs.min) + (position / objLine.offsetWidth) * ( parseFloat(attrs.max) - parseFloat(attrs.min) );
                    }
                    // console.log("positionToValue (p->v)" , position , '->' , valueToReturn);
                    valueToReturn = round(parseFloat(valueToReturn.toFixed(scope.decimals)), scope.roundingTo);
                    //                    valueToReturn = round( parseFloat( valueToReturn.toFixed(scope.decimals)) , scope.roundingTo).toFixed(scope.decimals);
                    return valueToReturn;

                };

                var affectValue = function () {
                    //console.log("kslider.affectValue()");
                    scope.valueToListen = scope.value;
                };


                var placeZero = function () {
                    if (!(scope.showZero && scope.min < 0 && scope.max > 0)) {
                        return;
                    }
                    var position = ValueToPositionPercentage(0);
                    if (scope.orientation == "H") {
                        if (objZeroBar)
                            objZeroBar.style.left = "calc(" + position + "% - " + (objZeroBar.offsetWidth / 2 ) + "px)";
                        if (objZeroNumber)
                            objZeroNumber.style.left = "calc(" + position + "% - " + (objZeroNumber.offsetWidth / 2 ) + "px)";
                    }
                    else {
                        if (objZeroBar)
                            objZeroBar.style.bottom = "calc(" + position + "% - " + (objZeroBar.offsetHeight / 2 ) + "px)" ;
                        // objZeroBar.style.bottom = (position - 1 + objButton.offsetHeight / 2 ) + "px";
                        if (objZeroNumber)
                            objZeroNumber.style.bottom = "calc(" + position + "% - " + (objZeroNumber.offsetHeight / 2 ) + "px)";
                        // objZeroNumber.style.bottom = (position + (objButton.offsetHeight - objZeroNumber.offsetHeight) / 2 ) + "px";
                    }
                };


                element[0].addEventListener('DOMMouseScroll', function (event) {
                    mouseWheel(event);
                });

                //var onWheel = function () {
                //    console.log('mouseWheel');
                //};
                //
                var createTimeout = function () {
                    intervalObj = $timeout(function () {
                        affectValue();
                        createTimeout();
                    }, scope.timeout);

                };
                var stopTimeout = function () {
                    if (intervalObj) {
                        $timeout.cancel(intervalObj);
                    }
                    intervalObj = null;
                };

                //For arrow click
                scope.arrowUpMouseDown = function (e) {
                    //                    console.log('Up - Mousedown');
                    if (!scope.enabled) return;
                    if (utils.isRightClick(e)) return;
                    //                    $("#kUpDownRangeUp_" + scope.updownid).css({ 'opacity': 0.7 });
                    if (scope.value < scope.max) {
                        scope.value++;
                    }
                    document.onmouseup = scope.arrowMouseUp;
                    affectValue();
                    createTimeout();
                    clickStart(1, 0, timerArrowInterval);//step , compteur :0 , First timer in ms
                };

                scope.arrowMouseUp = function (e) {
                    //                    console.log('Arrow - Mouseup');
                    if (!scope.enabled) return;
                    if (utils.isRightClick(e)) return;
                    //$("#kUpDownRangeUp_" + scope.updownid).css({ 'opacity': 1 });
                    clickStop();
                };

                scope.arrowDownMouseDown = function (e) {
                    //                    console.log('Down - Mousedown');
                    if (!scope.enabled) return;
                    if (utils.isRightClick(e)) return;
                    //                  $("#kUpDownRangeDown_" + scope.updownid).css({ 'opacity': 0.7 });
                    if (scope.value > scope.min) {
                        scope.value--;
                    }
                    document.onmouseup = scope.arrowMouseUp;
                    affectValue();
                    createTimeout();
                    clickStart(-1, 0, timerArrowInterval);//step , compteur :0 , First timer in ms
                };


                var clickStart = function (step, compteur, speed) {
                    //console.log("kslider.clickStart()");
                    //                    console.log("value: " + scope.value + " step: " + step + " timer : " + compteur + "/" + speed);
                    //                                currentStep = vl;
                    //                                compteur = 0 ;
                    intervalObjArrow = $timeout(function () {
                        scope.value += step;
                        compteur++;
                        if (compteur > steps) {
                            if (speed > timerArrowIntervalMin) {
                                clickStart(step, 0, speed / 2);
                            }
                            else {
                                clickStart((step < 0 ? -1 : 1 ) * bigstep, 0, timerArrowIntervalMin)
                            }
                        }
                        else {
                            clickStart(step, compteur, speed);
                        }
                    }, speed);
                };

                // For Arrow click END

                //What to do when variable included in valueToListen has changed


                scope.changeValue = function (v) {
                    //console.log("kslider.scope.changeValue("+ v + ")");
                    validateValue(v);
                    affectValue();
                };

                var changeValue = function (v) {
                    //console.log("kslider.changeValue("+ v + ")");
                    scope.$apply(function () {
                        validateValue(v);
                        affectValue();
                    });
                };

                scope.$watch('valueToListen', function (nv) {
                    //console.log("kslider.watch.valueToListen("+ nv + ")");
                    validateValue(nv);
                    if (angular.isDefined(nv)) {
                        //console.log("kslider.onValuToListenChanged("+ nv + ")");
                        scope.onValueToListenChanged({insideVal: nv});
                        scope.current_element.trigger('change');
                    }

                });

                scope.$watch('value', function (nv) {
                    //console.log("kslider.watch.value("+ nv + ")");
                    validateValue(nv);
                    if (angular.isDefined(nv)) {
                        scope.onValueChanged({insideVal: nv});
                        scope.percentage = 100 * (scope.value - scope.min) / (scope.max - scope.min);
                    }
                });

                // scope.$watch('visible', function (nv) {
                //     placeZero();
                // });

                scope.$watch('min', function (nv) {
                    bigstep = Math.round((scope.max - scope.min) / 100);
                    validateValue(scope.value);
                    //                    console.log('min value changed, new value = ' + nv + ', bigstep = ' + bigstep);
                    placeZero();
                });
                scope.$watch('max', function (nv) {

                    bigstep = Math.round((scope.max - scope.min) / 100);
                    validateValue(scope.value);
                    //                    console.log('max value changed, new value = ' + nv + ', bigstep = ' + bigstep);
                    placeZero();
                });


                var clickStop = function () {
                    if (intervalObjArrow) $timeout.cancel(intervalObjArrow);
                    intervalObjArrow = null;
                    stopTimeout();
                };

                scope.sliderDown = function () {
                    if (element.find('.kSlider')[0].classList.contains('disabled')) {
                        return;
                    }
                    scope.value--;
                };
                scope.sliderUp = function () {
                    if (element.find('.kSlider')[0].classList.contains('disabled')) {
                        return;
                    }
                    scope.value++;
                };

                function findParent(el, cls) {
                    while ((el = el.parentElement) && !el.classList.contains(cls));
                    return el;
                }


                ////////////
                var mouseDown = function (event) {
                    //console.log("kslider.mouseDown");
                    if (element.find('.kSlider')[0].classList.contains('disabled')) {
                        return;
                    }

                    var obj = event.target || event.srcElement;

                    if (event.ctrlKey) {
                        changeValue(scope.ctrlClickValue);
                        return;
                    }
                    //
                    //if (obj.className.indexOf('slider-min-value') >= 0) {
                    //    changeValue(scope.min);
                    //    return;
                    //}
                    //if (obj.className.indexOf('slider-max-value') >= 0 ||
                    //    obj.className.indexOf('slider-min-bar') >= 0 ||
                    //    obj.className.indexOf('slider-max-bar') >= 0 ||
                    //    obj.className.indexOf('slider-zero-bar') >= 0 ) {
                    //    return;
                    //}


                    if (obj.parentElement.className.indexOf('slider-progress') >= 0) {
                        obj = findParent(obj, 'slider-progress');
                    }
                    //if (obj.className.indexOf('slider-line') < 0
                    //    && obj.className.indexOf('slider-button') < 0
                    //) {
                    //    obj = findParent(obj, 'slider-line');
                    //}
                    //Click on slider line to put cursor in current mouse position or to move by step
                    if (obj && ( obj.className.indexOf('slider-line') >= 0 || obj.className.indexOf('slider-progress') >= 0)) {
                        objButton = element.find('.slider-button')[0] || element.parent().find('.slider-button')[0];
                        var pos = 0;
                        if (attrs.orientation == 'V') {
                            if (event.type == "touchstart") {
                                pos = event.target.getClientRects()[0].top + event.target.getClientRects()[0].height - event.touches[0].clientY;
                            }
                            else {
                                pos = event.target.offsetHeight - event.originalEvent.offsetY;//event.originalEvent.layerY ;//- (objButton.offsetHeight / 2);
                            }
                        }
                        else {
                            if (event.type == "touchstart") {
                                pos = event.touches[0].clientX - event.target.getClientRects()[0].left;
                            }
                            else {
                                pos = event.originalEvent.offsetX;//event.originalEvent.layerX ;//- (objButton.offsetWidth / 2);
                            }//event.clientX - obj.offsetLeft ;
                        }
                        //                        console.log("position: " + pos);

                        var clickSteps = parseInt(scope.clickSteps);
                        if (clickSteps > 0) {
                            if (positionToValue(pos) > scope.value) {

                                newValue = scope.value + clickSteps;
                            }
                            else {

                                newValue = scope.value - clickSteps;

                            }

                        }
                        else {
                            var newValue = positionToValue(pos);
                        }

                        //if (attrs.orientation == 'V')
                        //    {
                        //                                                            moveCursor(pos - (objButton.offsetHeight ));
                        //                                                        }
                        //                                                    else
                        //                                                        {
                        //                                                            moveCursor(pos - (objButton.offsetWidth ));
                        //                                                        }

                        //                            scope.valueToListen = positionToValue(pos);
                        scope.$apply(function () {
                            validateValue(newValue);
                            affectValue();
                        });

                        //alert(event.pageX);
                    }

                    //Click on slider button to move cursor depending to mouse position
                    if (obj && obj.className.indexOf('slider-button') >= 0) {
                        //                                                    console.log('mouseDown');
                        isMouseDown = true;

                        var objLine = findParent(objButton, 'slider-line');

                        if (attrs.orientation == 'V') {
                            //var screePosition =
                            scope.currentPosition = (event.clientY || event.touches[0].clientY) + (objLine.offsetHeight - obj.offsetTop) - (obj.offsetHeight / 2 );
                            obj.style.cursor = 'ns-resize';
                            objLine.style.cursor = 'ns-resize';
                        }
                        else {
                            scope.currentPosition = 0 + (event.clientX || event.touches[0].clientX) - obj.getBoundingClientRect().left - (obj.offsetWidth / 2 );
                            // console.log("scope.currentPosition " , scope.currentPosition );
                            obj.style.cursor = 'ew-resize';
                            objLine.style.cursor = 'ew-resize';
                        }

                        createTimeout();
                        document.onmouseup = mouseup;
                        document.onmousemove = mousemove;

                        obj.classList.add("onMove");
                        //document.onmousemove = mousemove(event , obj);
                    }

                };
                ////////////


                function bindElementMove() {

                    var obj = element[0].getElementsByClassName('kSlider')[0];

                    obj.addEventListener('touchstart', function (event) {
                        event.preventDefault();
                        mouseDown(event);
                    }, false);

                    element.bind('mousedown', function (event) {
                        mouseDown(event)
                    });

                    obj.addEventListener('touchend', function (event) {
                        //console.log('touchendend');
                        mouseup(event)
                    }, false);

                    obj.addEventListener('touchmove', function (event) {
                        event.preventDefault();
                        mousemove(event);
                        //console.log('touchmove');
                    }, false);

                }


                var mousemove = function (event) {
                    var objButton = document.getElementsByClassName('onMove')[0];
                    if (objButton == undefined) {
                        return;
                    }
                    var objLine = findParent(objButton, 'slider-line');
                    var objSlider = findParent(objButton, 'kSlider');
                    var pos = 0;
                    //                                    console.log(currentPosition + ' ' + event.clientY + ' ' + event.offsetY + ' ' + event.pageY + ' ' + event.screenY);
                    if (attrs.orientation == 'V') {
                        pos = ( scope.currentPosition - ( event.clientY || event.touches[0].clientY) );//event.offsetY - (objButton.offsetHeight / 2);//(objLine.offsetTop + objLine.offsetHeight + objLine.offsetParent.offsetTop ) - event.clientY - (objButton.offsetHeight / 2);
                    }//;- (objButton.offsetWidth / 2) ;//+ objLine.offsetLeft ;
                    else {
                        //pos = (event.clientX || event.touches[0].clientX) - objLine.offsetLeft - (objButton.offsetWidth / 2);
                        pos = (event.clientX || event.touches[0].clientX) - objLine.getBoundingClientRect().left - scope.currentPosition;//- (objButton.offsetWidth / 2);
                        // console.log("event.clientX / objLine.getBoundingClientRect().left" , event.clientX , '/' , objLine.getBoundingClientRect().left);
                    } //;- (objButton.offsetWidth / 2) ;//+ objLine.offsetLeft ;


                    scope.$apply(function () {
                        scope.value = positionToValue(pos);//TODO value = value calculated regarding position
                        validateValue(scope.value);
                        //affectValue();
                    });

                };

                function mouseup() {
                    //                                    console.log('mouseUp');
                    isMouseDown = false;
                    var obj = document.getElementsByClassName('onMove')[0];
                    if (obj != undefined) {
                        var objLine = findParent(objButton, 'slider-line');
                        obj.classList.remove('onMove');
                        //obj.style.cursor = 'pointer';
                        //objLine.style.cursor = 'pointer';
                        obj.style.removeProperty('cursor');
                        objLine.style.removeProperty('cursor');
                    }

                    document.onmousemove = function () {
                    };
                    document.onmouseup = function () {
                    };
                    stopTimeout();
                    scope.$apply(function () {
                        affectValue();
                    });


                }

//TODO: fa put only one function round somewhere
                function round(value, step) {
                    if (step == 0)
                        return value;
                    step || (step = 1.0);
                    var inv = 1.0 / step;
                    return Math.round(value * inv) / inv;
                }

            }
        }
    }
    ])
    ;
})();

