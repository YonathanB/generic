/***********************************************
 * File Name: kTime.js
 * Created by: Chezi Hoyzer
 * On: 25/11/2014  14:10
 * Last Modified: 04/07/2017
 * Modified by: Fassous
 ***********************************************/

(function () {
    angular.module('components.widgets').directive("kTime", ['$timeout', function ($timeout) {

        return {
            restrict: 'E',
            scope: {
                allowEmpty: '@',
                autoCorrectValue: '=',
                controlClass: '@',
                enabled: '=',
                initVal: '@',
                isError: '=',
                max: '@',
                min: '@',
                minuteStep: '@',
                placeholder: "@",
                showSeconds: '=',
                controlInputClass: '@',
                value: '=', //format hh:mm:ss or hh:mm depend on showSeconds
                hh: '=?',
                mm: '=?',
                ss: '=?'
            },
            template: '<input class="kTime {{controlClass}}" ' +
            '       ng-class="{\'show-seconds\':showSeconds,disabled : !enabled }" ' +
            '       ng-model="showValue" ' +
            '       ng-change="showValueChange()" ' +
            '       ng-trim="false" ' +
            '       ng-keydown="keydown($event)" ' +
            '       ng-keyup="keyup($event)"' +
            '       ng-blur="onBlur($event)"' +
            '       placeholder="{{placeholder}}" ' +
            '       ng-disabled="!enabled"' +
            '>',
            compile: function (element, attrs) {
                // if (!attrs.value) {
                //     attrs.value = "00:00:00";
                // }
                if (!attrs.allowEmpty)
                    attrs.allowEmpty = "true";
                if (!attrs.autoCorrectValue)
                    attrs.autoCorrectValue = "true";
                if (!attrs.enabled)
                    attrs.enabled = "true";
                if (!attrs.maxHours)
                    attrs.maxHours = 23;
                if (!attrs.minHours)
                    attrs.minHours = 0;
                if (!attrs.minuteStep)
                    attrs.minuteStep = "1";
                if (!attrs.showSeconds)
                    attrs.showSeconds = "false";
                if (!attrs.initVal && !attrs.value)
                    attrs.initVal = "00:00";
                return this.link;
            },
            link: function (scope, element, attrs) {
                var CONSTANTS = {
                    "UPDATE_SHOW_VALUE": 1,
                    "DONT_UPDATE_SHOW_VALUE": 0,
                    "KEEP_CURSOR_POSITION": 1,
                    "DONT_KEEP_CURSOR_POSITION": 0,
                    "DETECT_TYPE":1,
                    "DONT_DETECT_TYPE":0
                };

                var TYPE = "string"; //"date" , "string"
                var cursorPosition = null;
                var currentArrowChange = ""; //values : "hh" , "mm" , "ss"

                var correctShowValue = function () {

                };

                scope.$watch('initVal', function (val, ov) {
                    if ( val == undefined )
                        return;
                    TYPE = typeof val;
                    if (typeof val.getMonth === 'function')
                        TYPE = "date";
                    initValueProcess(val);
                });

                scope.$watch('value', function (val, ov) {
                    if ( val == undefined )
                        return;
                    TYPE = typeof val;
                    if (typeof val.getMonth === 'function')
                        TYPE = "date";
                    initValueProcess(val);
                });

                var setValue = function (updateShowValue) {

                    if (scope.ss > 59) {
                        scope.ss = 0;
                        scope.mm++;
                    }
                    if (scope.mm > 59) {
                        scope.mm = 0;
                        scope.hh++;
                    }
                    if (scope.hh > 23) {
                        scope.hh = 0;
                    }
                    if (scope.ss < 0) {
                        scope.ss = 59;
                        scope.mm--;
                    }
                    if (scope.mm < 0) {
                        scope.mm = 59;
                        scope.hh--;
                    }
                    if (scope.hh < 0) {
                        scope.hh = 23;
                    }

                    if (TYPE == "string" || updateShowValue) {
                        var textValue = "";
                        if (scope.hh < 10)
                            textValue += "0";
                        textValue += scope.hh;
                        textValue += ":";
                        if (scope.mm < 10)
                            textValue += "0";
                        textValue += scope.mm;
                        if (scope.showSeconds) {
                            textValue += ":";
                            if (scope.ss < 10)
                                textValue += "0";
                            textValue += scope.ss;
                        }
                    }

                    switch (TYPE) {
                        case "string":
                            scope.value = textValue;
                            break;
                        case "date":
                            scope.value.setHours(parseInt(scope.hh));
                            scope.value.setMinutes(parseInt(scope.mm));
                            if (scope.showSeconds)
                                scope.value.setSeconds(parseInt(scope.ss));
                            else
                                scope.value.setSeconds(0);
                            scope.value.setMilliseconds(0);
                    }

                    if (updateShowValue) {
                        scope.showValue = textValue;
                    }
                };

                var initValueProcess = function ( val ) {
                    switch (typeof val) {
                        case "undefined":
                            return;
                            break;
                        case "string":
                            // TYPE = "string";
                            var valArray = val.split(":");
                            scope.hh = parseInt(valArray[0]) || 0;
                            scope.mm = parseInt(valArray[1]) || 0;
                            scope.ss = parseInt(valArray[2]) || 0;
                            break;
                        case "object":
                            if (typeof val.getMonth === 'function') {
                                scope.hh = val.getHours();
                                scope.mm = val.getMinutes();
                                if (scope.showSeconds) {
                                    scope.ss = val.getSeconds();
                                } else {
                                    scope.ss = 0;
                                }
                            }
                    }

                    setValue(CONSTANTS.UPDATE_SHOW_VALUE)
                };


                scope.onBlur = function(){
                    initValueProcess(scope.showValue);
                };

                scope.keydown = function (event) {
                    var keyCode = event.keyCode || event.which;

                    console.log("KEYPRESSED", event.which);

                    if (keyCode >= 96 && keyCode <= 105) {
                        // Numpad keys
                        keyCode -= 48;
                    }
                    // if (( keyCode < 48 || keyCode > 57) && keyCode != 37 && keyCode != 39 && event.key != ":") {
                    //     event.preventDefault();
                    // }

                    if (keyCode == 13) {
                        initValueProcess(scope.showValue);
                    }

                    //search position of cursor
                    if (keyCode == 38 || keyCode == 40) {
                        event.preventDefault();
                        element.children()[0].classList.add("arrow-in-use");
                        if (cursorPosition == null){
                            cursorPosition = element.children()[0].selectionStart;
                            initValueProcess(scope.showValue);
                        }
                        // console.log("KEYDOWN: ", keyCode );

                        var valueSplit = scope.showValue.split(":");
                        if (currentArrowChange == "") {
                            if (valueSplit.length == 1 || cursorPosition <= valueSplit[0].length) {
                                currentArrowChange = "hh";
                            } else if (valueSplit.length == 2 || cursorPosition <= valueSplit[0].length + 1 + valueSplit[1].length) {
                                currentArrowChange = "mm";
                            } else {
                                currentArrowChange = "ss";
                            }
                        }

                        if (keyCode == 38) {
                            scope[currentArrowChange]++;
                        }
                        if (keyCode == 40) {
                            scope[currentArrowChange]--;
                        }
                        setValue(CONSTANTS.UPDATE_SHOW_VALUE, CONSTANTS.KEEP_CURSOR_POSITION);
                    }

                };

                scope.keyup = function (event, rowIndex) {
                    var regExpr = new RegExp("[^0-9:]", "g");
                    if( scope.showValue != scope.showValue.replace(regExpr, "") ){
                        scope.showValue = scope.showValue.replace(regExpr, "");
                    }

                    if (cursorPosition != null) {
                        $timeout(function () {
                            element.children()[0].selectionStart = cursorPosition;
                            element.children()[0].selectionEnd = cursorPosition;
                            cursorPosition = null
                        }, 100);
                    }

                    currentArrowChange = "";
                    if(/^[0-9]{2}$/.test(scope.showValue) && event.key!=8){
                        scope.showValue+= ":";
                    }
                    if(scope.showSeconds && /^[0-9]{2}:[0-9]{2}$/.test(scope.showValue) && event.key!=8){
                        scope.showValue+= ":";
                    }

                    element.children()[0].classList.remove("arrow-in-use");
                    // var keyCode = event.keyCode || event.which;
                    // if (keyCode >= 96 && keyCode <= 105) {
                    //     // Numpad keys
                    //     keyCode -= 48;
                    // }

                    // if (keyCode >= 48 && keyCode <= 57) {
                    //     if (event.target.value.length == 2 && event.target.value.substring(event.target.value.length - 1) != ":") {
                    //         event.target.value += ":";
                    //     }
                    //     if (event.target.value.length == 5 && event.target.value.substring(event.target.value.length - 1) != ":" && scope.showSeconds) {
                    //         event.target.value += ":";
                    //     }
                    // }
                    // if (event.target.value.substr(event.target.value.length - 2) == "::")
                    //     event.target.value = event.target.value.substr(0, event.target.value.length - 1);
                    //validateValue(scope.showValue);
                };


                // scope.showValueChange = function () {
                //     var newValue = scope.showValue;
                //     if (newValue == undefined || newValue === "")
                //         return;
                //
                //     newValue = newValue.replaceAll("::", ":");
                //
                //     scope.showValue = newValue;
                //     // validateValue(newValue);
                //
                // };

                function getCaretCharacterOffsetWithin(element) {
                    var caretOffset = 0;
                    if (typeof window.getSelection != "undefined") {
                        var range = window.getSelection().getRangeAt(0);
                        var preCaretRange = range.cloneRange();
                        preCaretRange.selectNodeContents(element);
                        preCaretRange.setEnd(range.endContainer, range.endOffset);
                        caretOffset = preCaretRange.toString().length;
                    } else if (typeof document.selection != "undefined" && document.selection.type != "Control") {
                        var textRange = document.selection.createRange();
                        var preCaretTextRange = document.body.createTextRange();
                        preCaretTextRange.moveToElementText(element);
                        preCaretTextRange.setEndPoint("EndToEnd", textRange);
                        caretOffset = preCaretTextRange.text.length;
                    }
                    return caretOffset;
                }
            }
        };
    }]);
})();

