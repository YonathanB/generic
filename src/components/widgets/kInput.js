/***********************************************
 * File Name: kInput.js
 * Created by: fassous
 * On: 27/11/2016 13:47
 * Last Modified:
 * Modified by:
 ***********************************************/
(function () {
    angular.module('components.widgets').directive("kInput", ['$timeout', '$interval', function ($timeout, $interval) {
        return {
            restrict: 'E',
            scope: {
                autoCorrectValue: '=',
                controlClass: '@',
                controlInputClass: '@',
                enabled: '=',
                enterClick: '&',
                enterPressedBefore: '&',
                enterPressedAfter: '&',
                errorMessage: '@',
                initVal: '@',
                isError: '=',
                leadingZero: '@',
                max: '@',
                min: '@',
                placeholder: '@',
                timeout: '@',
                title: "@",
                unit: '@',
                value: '=',
                valueToListen: '=?',
                onValueToListenChanged: '&', // must use like this: setClickFunctionName(insideVal) for deliver the value into the function
                decimals: '@',
                roundingTo: '@',
                steps: '@',
                showInputArrows: "=",
                validateOnArrow: '=',
                validateOnEnter: '=',
                validateOnBlur: '='
            },
            template: "<div class='kInput {{controlClass}}' ng-class='{disabled : !enabled }' title='{{title}}'>" +
            "   <input class='{{controlInputClass}}' " +
            "       ng-model='showValue' " +
            "       ng-change='showValueChange()'" +
            "       ng-trim='false' " +
            "       ensure-expression='{invalid: !isError}'" +
            "       ng-keydown='keydownpress($event)' " +
            "       ng-keyup='keyup($event)' " +
            "       placeholder='{{placeholder}}'  " +
            "       ng-class='{disabled : !enabled }' " +
            "       ng-disabled='!enabled'" +
            "       ng-blur='onBlur()'" +
            // "       number-only='test22'" +
            // "       is-decimal='internal.isDecimal'" +
            // "       is-negative='internal.isNegatif'" +
            ">" +
            "   <span ng-if='\"{{unit}}\"!=\"\"' ng-show='showValue!=\"\"' class='kUnit'>{{unit}}</span>" +
            "   <span ng-if='false' class='error-message'>{{errorMessage}}</span>" +
            "   <div class='kInput-arrows' ng-if='showInputArrows'>" +
            // "       <div class='kInput-arrows-up' ng-mousedown='arrowMouseDown($event , \"up\")' ng-mouseup='arrowMouseUp($event, \"up\")' ng-mouseleave='arrowMouseUp($event, \"up\")' title='Up'></div>"+
            // "       <div class='kInput-arrows-down' ng-mousedown='arrowMouseDown($event, \"down\")' ng-mouseup='arrowMouseUp($event, \"down\")' ng-mouseleave='arrowMouseUp($event, \"down\")' title='Down'></div>"+
            "       <div class='kInput-arrows-up' ng-mousedown='arrowMouseDown($event , \"up\")' title='Up'></div>" +
            "       <div class='kInput-arrows-down' ng-mousedown='arrowMouseDown($event, \"down\")' title='Down'></div>" +
            "   </div>" +
            "</div>",
            compile: function (element, attrs) {
                if (!attrs.autoCorrectValue) {
                    attrs.autoCorrectValue = "false";
                }
                if (!attrs.enabled) {
                    attrs.enabled = "true";
                }
                if (!attrs.timeout) {
                    attrs.timeout = 500;
                }
                if (!attrs.max) {
                    attrs.max = "";
                }

                if (!attrs.valueToListen) {
                    attrs.valueToListen = 0;
                }
                if (!attrs.min) {
                    attrs.min = "";
                }
                if (!attrs.controlClass) {
                    attrs.controlClass = "";
                }
                if (!attrs.placeholder) {
                    attrs.placeholder = "";
                }

                if (!attrs.isTabNext) {
                    attrs.isTabNext = "false";
                }
                if (!attrs.isBackPrev) {
                    attrs.isBackPrev = "false";
                }
                if (!attrs.errorMessage) {
                    attrs.errorMessage = "out of range";
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
                if (!attrs.isError) {
                    attrs.isError = "false";
                }
                if (!attrs.validateOnEnter) {
                    attrs.validateOnEnter = "false";
                }
                if (!attrs.validateOnArrow) {
                    attrs.validateOnArrow = "false";
                }
                if (!attrs.validateOnLeave) {
                    attrs.validateOnLeave = "false"
                }
                if (!attrs.validateOnBlur) {
                    attrs.validateOnBlur = "false"
                }
                if (!attrs.showInputArrows) {
                    attrs.showInputArrows = "false"
                }

                return this.link;
            },
            link: function (scope, element, attrs) {

                var isUsingArrow = false;
                var intervalObj = null;
                var isInternal = {"value": false, "showValue": false};
                var CONSTANTS = {
                    "UPDATE_SHOW_VALUE": 1,
                    "DONT_UPDATE_SHOW_VALUE": 0,
                    "SEND_TO_DEVICE": 1,
                    "DONT_SEND_TO_DEVICE": 0
                };
                var min = "";
                var max = "";
                var timerIntervalMax = 500;
                var timerIntervalMin = 50;
                var regularExpressionValidation;

                var init = function () {

                    //console.log("kInput.init()");
                    scope.decimals = parseInt(scope.decimals);
                    // console.log('scope.decimals', scope.decimals);
                    isInternal.showValue = true;
                    if (scope.initVal != undefined) {
                        showValueSet(scope.initVal);
                        // scope.showValue = parseFloat(scope.initVal).toFixed(scope.decimals);
                        scope.value = parseFloat(scope.initVal);
                        validateValue(scope.showValue, CONSTANTS.DONT_UPDATE_SHOW_VALUE, CONSTANTS.DONT_SEND_TO_DEVICE);
                    }
                    else {
                        showValueSet(scope.value);
                        // scope.showValue = parseFloat(scope.value).toFixed(scope.decimals);
                    }

                    if (scope.validateOnEnter || scope.validateOnEnter == "true") {
                        var inputObject = element[0].getElementsByTagName("input")[0];
                        inputObject.onblur = function () {
                            validateValue(scope.showValue);
                        };
                    }
                    regularExpressionValidation = generateRegularExpression();


                };

                $timeout(init, 0);


                var showValueSet = function(val){
                    val = val ||0;
                    scope.showValue = round(parseFloat(val), scope.roundingTo).toFixed(scope.decimals);
                    if(scope.leadingZero > 0){
                        var number = scope.showValue.split(".")[0];
                        scope.showValue  = '0'.repeat( Math.max( 0 , scope.leadingZero - number.length ) ) +  scope.showValue;
                    }
                    // ('0' + currentDate.getHours()).slice(-2)
                };

                scope.$watch('value', function (val, ov) {
                    //console.log("kInput.watch.value("+ val + ")");
                    //val = parseIntOrEmpty(val);//Added by FA
                    //$("#kInputRange_" + scope.inputrangeid).val(val);
                    if (isInternal.value) return isInternal.value = false;
                    if (val == undefined)
                        return;
                    isInternal.showValue == true;
                    // scope.showValue = parseFloat(val).toFixed(scope.decimals);
                    showValueSet(val);
                    //validateValue(CONSTANTS.UPDATE_SHOW_VALUE);
                    shiftSpanLeft(element);
                });


                var validateValue = function (value, updateShowValue, sendToDevice) {
//                    shiftSpanLeft(element);
//                     return;
//                     scope.value = parseFloat( value );
//                     return;
                    //console.log("kInput.validateValue()");
                    if (updateShowValue == undefined)
                        updateShowValue = true;
                    if (sendToDevice == undefined)
                        sendToDevice = true;


                    if (valueIsValid( value )) {
                        if (updateShowValue) {
                            if (max !== "")
                                scope.showValue = Math.min(parseFloat(scope.showValue), parseFloat(max));//Added by FA when value is changed outside the object
                            if (scope.min !== "")
                                scope.showValue = Math.max(parseFloat(scope.showValue), parseFloat(min));//the test must be done here
                            var roundedValue = round(parseFloat(scope.showValue), scope.roundingTo).toFixed(scope.decimals);
                            scope.showValue = roundedValue;
                        }
                        else {
                            var roundedValue = round(parseFloat(scope.showValue), scope.roundingTo).toFixed(scope.decimals);
                        }

                        isInternal.value = true;
                        scope.value = parseFloat(roundedValue);
                        if (sendToDevice) {
                            scope.valueToListen = scope.value;
                            if (scope.onValueToListenChanged) {
                                scope.onValueToListenChanged({insideVal: scope.value});
                            }
                        }


                        // scope.showValue = parseFloat(scope.value).toFixed(scope.decimals);
                    }
                    shiftSpanLeft(element);
                };

                var generateRegularExpression = function () {
                    var regExprString = "0-9";
                    if (!isNaN(parseInt(min)) && parseInt(min) < 0)
                        regExprString += "-";
                    if (!isNaN(parseInt(scope.decimals)) && parseInt(scope.decimals) > 0)
                        regExprString += ".";
                    var regExpr = new RegExp("[^" + regExprString + "]", "g");
                    return regExpr;

                };

                var keepFirstOccurenceOfString = function(stringValue , stringToSearch){
                    var stringArray = stringValue.split(stringToSearch);
                    if(stringArray.length>2)
                        var valueToReturn = stringArray.splice(0,2).join( stringToSearch) + stringArray.join('');
                    else
                        valueToReturn = stringValue;
                    return valueToReturn


                }
                scope.showValueChange = function (val, oldValue) {
                    //console.log("kInput.showValueChange("+ scope.showValue + ")");
                    //if (isInternal.showValue) return isInternal.showValue = false;
//                    if (val == undefined)
//                         return;
                    // console.log("showValue", val);
                    scope.showValue = scope.showValue.replace(regularExpressionValidation, "");
                    scope.showValue = keepFirstOccurenceOfString( scope.showValue , ".");
                    scope.showValue = keepFirstOccurenceOfString( scope.showValue , "-");



                    if (!isUsingArrow && !scope.validateOnEnter && scope.validateOnEnter != "true") {
                        validateValue(scope.showValue, CONSTANTS.DONT_UPDATE_SHOW_VALUE);
                    }
                    else {
                        shiftSpanLeft(element);
                    }

                };

                /*                scope.$watch('showValue', function (val, oldValue) {
                 //console.log("kInput.watch.showValue("+ val + ")");
                 if (isInternal.showValue) return isInternal.showValue = false;
                 if (val == undefined)
                 return;
                 // console.log("showValue", val);
                 if (!isUsingArrow && !scope.validateOnEnter && scope.validateOnEnter != "true") {
                 validateValue();
                 }
                 shiftSpanLeft(element);
                 });
                 */


                var valueIsValid = function ( value ) {
                    if (value == undefined || isNaN(value))
                        return false;
                    scope.isError =
                        value == "-" ||
                        isNaN(parseFloat( value )) ||
                        (max !== "" && parseFloat( value ) > parseFloat(max)) ||
                        (min !== "" && parseFloat( value ) < parseFloat(min));

                    if (scope.isError) {
                        //element.children('.kInputRange')[0].classList.add('error')
                        addClass(element.children()[0], 'error');
                        addClass(element.children()[0].getElementsByTagName('input')[0], 'error');
                        addClass(element.parents('.kUpDownRange')[0], 'error');
                        addClass(element.parents('.kInputSet')[0], 'error');
                    }
                    else {
                        //element.children('.kInputRange')[0].classList.remove('error');
                        removeClass(element.children()[0], 'error');
                        removeClass(element.children()[0].getElementsByTagName('input')[0], 'error');
                        removeClass(element.parents('.kUpDownRange')[0], 'error');
                        removeClass(element.parents('.kInputSet')[0], 'error');
                    }

                    return !scope.isError;
                };

                var addClass = function (obj, className) {
                    if (obj) {
                        obj.classList.add(className);
                    }
                };
                var removeClass = function (obj, className) {
                    if (obj) {
                        obj.classList.remove(className);
                    }
                };

                var correctShowvalue = function () {
                    if (parseFloat(scope.showValue) < parseFloat(min)) {
                        scope.showValue = parseFloat(min).toFixed(scope.decimals);
                        shiftSpanLeft(element);
                    }
                    if (parseFloat(scope.showValue) > parseFloat(max)) {
                        scope.showValue = parseFloat(max).toFixed(scope.decimals);
                        shiftSpanLeft(element);
                    }
                };

                scope.keydownpress = function (e) {
                    var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
                    if (key == 38 || key == 40) {
                        // if (scope.max !== "")
                        //     scope.showValue = Math.min(scope.showValue, scope.max);//Added by FA when value is changed outside the object
                        // if (scope.min !== "")
                        //     scope.showValue = Math.max(scope.showValue, scope.min);//the test must be done here
                        isUsingArrow = true;
                        if (key == 38)//arrow up
                        {
                            if (max === "" || parseFloat(scope.showValue) < parseFloat(max) || scope.showValue === "") {
                                //scope.$apply(function ()
                                //{
                                if (scope.showValue === "") {
                                    if (min !== "")
                                        showValueSet( min );
                                    else
                                        showValueSet( "0" );
                                }
                                else {
                                    showValueSet( parseFloat(scope.showValue) + parseFloat(scope.steps));
                                }
                                shiftSpanLeft(element);
                                // scope.value = scope.value === "" ? scope.min : parseInt(scope.value) + 1;
                                //});
                            }
                        }
                        else if (key == 40)//arrow down
                        {
                            if (min === "" || parseFloat(scope.showValue) > parseFloat(min) || scope.showValue === "") {
                                //scope.$apply(function ()
                                //{
                                if (scope.showValue === "") {
                                    if (max !== "")
                                        showValueSet( max );
                                    else
                                        showValueSet( 0 );
                                }
                                else {
                                    showValueSet( parseFloat(scope.showValue) - parseFloat(scope.steps) );
                                }
                                // scope.value = scope.value === "" ? scope.min : parseInt(scope.value) - 1;
                                //});
                                shiftSpanLeft(element);
                            }

                        }
                        correctShowvalue();


                        if ((!scope.validateOnEnter && scope.validateOnEnter != "true") || ( scope.validateOnArrow || scope.validateOnArrow == "true")) {
                            if (intervalObj == null) {
                                intervalObj = $interval(function () {
                                    $timeout(function () {
                                        scope.$apply(function () {
                                            // if (oldValToListen != scope.value) {
                                            //     oldValToListen = scope.valueToListen = scope.value;
                                            // }
                                            validateValue(scope.showValue , CONSTANTS.DONT_UPDATE_SHOW_VALUE, CONSTANTS.SEND_TO_DEVICE);
                                            // scope.valueToListen = scope.value;
                                        });
                                    }, 0)
                                }, scope.timeout);
                            }
                        }


                    }


                    if (key == 13)//Enter
                    {
                        scope.enterClick();
                        scope.enterPressedBefore();
                        if (scope.validateOnEnter || scope.validateOnEnter == "true") {
                            if (scope.autoCorrectValue) {
                                correctShowvalue();
                            }
                            validateValue(scope.showValue);
                        }
                        scope.enterPressedAfter();
                    }
                }
                ;

                scope.keyup = function (e) {
                    var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
                    if (key == 38 || key == 40) {
                        isUsingArrow = false;
                        if ((!scope.validateOnEnter && scope.validateOnEnter != "true") || ( scope.validateOnArrow || scope.validateOnArrow == "true")) {

                            $timeout(function () {
                                scope.$apply(function () {
                                    // if (oldValToListen != scope.value) {
                                    //     oldValToListen = scope.valueToListen = scope.value;
                                    validateValue(scope.showValue);
                                    // scope.valueToListen = scope.value;
                                    // }
                                });
                            }, 0);
                        }
                        if (intervalObj) $interval.cancel(intervalObj);
                        intervalObj = null;
                    }

                    // if (key == 8)//backSpace
                    // {
                    //     if (utils.isTrue(scope.isBackPrev)) {
                    //
                    //         if (element[0].getElementsByTagName('input')[0].value == "0")//if input is empty go to prev input
                    //         {
                    //             var prevInput = document.getElementById("kInputRange_" + (parseInt(scope.inputrangeid) - 1));
                    //             prevInput.focus();
                    //             //prevInput.setSelectionRange(0, prevInput.value.length);
                    //         }
                    //     }
                    // }

                };

                scope.$on("$destroy", function () {
                    if (intervalObj)
                        $interval.cancel(intervalObj);
                    intervalObj = null;
                });


                var shiftSpanLeft = function (ele) {
                    var iDummy = document.getElementById("dummyString");
                    if (iDummy === null) {
                        iDummy = document.createElement("span");
                        iDummy.setAttribute("id", "dummyString");
                        iDummy.style.visibility = "hidden";// .display = "none"; doesn't work
                        document.body.appendChild(iDummy);
                    }
                    var iFontName = ele.find('input').css('font-family');
                    var iFontSize = ele.find('input').css('font-size');

                    iDummy.style.fontSize = iFontSize;
                    iDummy.style.fontFamily = iFontName;
                    iDummy.textContent = scope.showValue;
                    ele.find('.kUnit').css('left', (iDummy.offsetWidth + 5 ) + 'px');
                };


                function round(value, step) {
                    if (step == 0)
                        return value;
                    step || (step = 1.0);
                    var inv = 1.0 / step;
                    return Math.round(value * inv) / inv;
                }


                scope.$watch('initVal', function (val, ov) {
                    //console.log("kInput.watch.initVal("+ val + ")");
                    //test below is to not update the showValue when it's sent to device and come back by initVal
                    if (!isNaN(val) && val != "" && parseFloat(val) != parseFloat(scope.showValue)) {
                        isInternal.showValue == true;
                        scope.value = scope.showValue = parseFloat(val).toFixed(scope.decimals);
                        // isInternal == true;
                        validateValue(scope.showValue, CONSTANTS.DONT_UPDATE_SHOW_VALUE, CONSTANTS.DONT_SEND_TO_DEVICE);
                    }
                });

                scope.$watch('decimals', function (val, ov) {
                    regularExpressionValidation = generateRegularExpression();
                });

                scope.$watch('min', function (val, ov) {
                    if (!isNaN(val) && val != "") {
                        min = parseFloat(val);//.toFixed(scope.decimals);
                        regularExpressionValidation = generateRegularExpression();
                        validateValue(scope.value, CONSTANTS.DONT_UPDATE_SHOW_VALUE, CONSTANTS.DONT_SEND_TO_DEVICE);
                    }
                });

                scope.$watch('max', function (val, ov) {
                    if (!isNaN(val) && val != "") {
                        max = parseFloat(val);//.toFixed(scope.decimals);
                        validateValue(scope.value, CONSTANTS.DONT_UPDATE_SHOW_VALUE, CONSTANTS.DONT_SEND_TO_DEVICE);
                        // console.log("min", scope.min, min);
                    }
                });


                scope.arrowMouseDown = function (e, direction) {
                    if (!scope.enabled) return;
                    if (utils.isRightClick(e)) return;
                    //$("#kUpDownRangeUp_" + scope.updownid).css({'opacity': 0.7});
                    if (direction == "up")
                        var arrow = element.children().find('.kInput-arrows-up')[0];
                    else
                        var arrow = element.children().find('.kInput-arrows-down')[0];
                    arrow.style.opacity = "0.7";
                    if (isNaN(parseFloat(scope.showValue))) {
                        if (scope.min != undefined)
                            showValueSet( scope.min );
                        else
                            showValueSet(  0 );
                    }

                    window.addEventListener("blur", pageLeave);
                    arrow.addEventListener("mouseleave", arrowMouseUp);
                    arrow.addEventListener("mouseup", arrowMouseUp);

                    controlClick(direction, function () {
                        startClicktimeout(direction, timerIntervalMax, 1);
                    }, 1);
                    if (intervalObj == null) {
                        intervalObj = $interval(function () {
                            //$timeout(function () {
                            //    scope.$apply(function () {
                            if (scope.validateOnArrow) {
                                scope.valueToListen = scope.value;
                            }
                            //});
                            //}, 0)
                        }, scope.timeout);

                    }
                };

                var arrowMouseUp = function () {
                    if (!scope.enabled) return;
                    // if (utils.isRightClick(e)) return;
                    element.children().find('.kInput-arrows-up')[0].style.opacity = "1";
                    element.children().find('.kInput-arrows-down')[0].style.opacity = "1";
                    if (timeoutObj) $timeout.cancel(timeoutObj);
                    if (scope.validateOnArrow) {
                        scope.valueToListen = scope.value;
                    }
                    if (intervalObj) $interval.cancel(intervalObj);
                    intervalObj = null;
                };

                var controlClick = function (arrowType, callBack, factor) {
                    if (arrowType == "up") {
                        var newValue = parseFloat(scope.showValue) + ( parseFloat(scope.steps) * factor );
                    }
                    else {
                        var newValue = parseFloat(scope.showValue) - ( parseFloat(scope.steps) * factor );
                    }
                    if (newValue == undefined)
                        newValue = min;
                    if (newValue > max)
                        newValue = max;
                    if (newValue < min)
                        newValue = min;

                    scope.value = newValue;
                    showValueSet( newValue );
                    if(scope.validateOnArrow || scope.validateOnArrow =="true")
                        validateValue(scope.showValue, CONSTANTS.DONT_UPDATE_SHOW_VALUE, CONSTANTS.SEND_TO_DEVICE);
                    else
                        validateValue(scope.showValue, CONSTANTS.DONT_UPDATE_SHOW_VALUE, CONSTANTS.DONT_SEND_TO_DEVICE);
                    callBack();

                };


                var startClicktimeout = function (arrowType, timeout, multiple) {
                    timeoutObj = $timeout(function () {
                        var newTimeout = parseInt((timeout / 1.1) < timerIntervalMin ? timerIntervalMin : (timeout / 1.1));
                        var newMultiple = Math.ceil(-0.045 * newTimeout + 12.25) < 1 ? 1 : Math.ceil(-0.045 * newTimeout + 12.25);//function y = -0.045x+12.25 gives: if timeout=50 mult=1 if timeout=250 mult=1
                        controlClick(arrowType, function () {
                            startClicktimeout(arrowType, newTimeout, newMultiple);
                        }, multiple);
                    }, timeout)
                };


                var pageLeave = function () {
                    console.log("out");
                    window.removeEventListener("blur", pageLeave);
                    if (timeoutObj) $timeout.cancel(timeoutObj);
                    if (intervalObj) $interval.cancel(intervalObj);
                    intervalObj = null;
                };

                scope.onBlur = function () {
                    if (scope.validateOnBlur) {
                        // console.log("LEAVE", scope.showValue);
                        if (scope.autoCorrectValue) {
                            correctShowvalue();
                        }
                        validateValue(scope.showValue);
                    }
                    else {
                        validateValue(scope.showValue, CONSTANTS.DONT_UPDATE_SHOW_VALUE, CONSTANTS.DONT_SEND_TO_DEVICE);
                    }
                };

            }
        };
    }]);
})();