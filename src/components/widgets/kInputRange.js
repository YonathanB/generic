/***********************************************
 * File Name: kInputRange.js
 * Created by: Chezi Hoyzer
 * On: 21/09/2014  12:44
 * Last Modified: 13/04/2015
 * Modified by: Fassous
 ***********************************************/
(function () {
    angular.module('components.widgets').directive("kInputRange", ['$timeout', '$interval', function ($timeout, $interval) {
        return {
            restrict: 'E',
            scope: {
                initVal: '@',
                value: '=',
                enabled: '=',
                valueToListen: '=',
                timeout: '@',
                isTabNext: '@',//used by IP control
                isBackPrev: '@',//used by IP control
                allowZero: '@',//used by IP control
                allowEmpty: '@',//used by IP control
                inputrangeid: '@',
                max: '@',
                min: '@',
                controlClass: '@',
                controlInputClass: '@',
                placeholder: '@',
                errorMessage: '@',
                unit: '@',
                title:"@",
                enterClick: '&',
                kOnBlur: '&',
                validate: '=?'
            },
            template: "" +
            "<div class='kInputRange {{controlClass}}' ng-class='{disabled : !enabled }' title='{{title}}'>" +
            "<input ng-blur='kOnBlur()' class='{{controlInputClass}}' data-rangeid='{{inputrangeid}}' ng-model='value' ng-trim='false' " +
            "ng-change='validateInputchange($event)' ng-keydown='keydownpress($event)' ng-keyup='keyup($event)' " +
            "placeholder='{{placeholder}}'  ng-class='{disabled : !enabled }' ng-disabled='!enabled' />" +
            "<span ng-if='\"{{unit}}\"!=\"\"' class='kUnit'>{{unit}}</span>" +
            "<span ng-if='false' class='error-message'>{{errorMessage}}</span>" +
            "</div>" +
            "<div ng-show='!validate && (value < min || value>max)' class='range-error'>* {{errorMessage}}</div>",
            compile: function (element, attrs) {
                if (!attrs.enabled) {
                    attrs.enabled = "true";
                }
                if (!attrs.timeout) {
                    attrs.timeout = 500;
                }

                if (!attrs.max) {
                    attrs.max = "";
                }
                if (!attrs.value) {
                    attrs.value = "0";
                }
                if (!attrs.valueToListen) {
                    attrs.valueToListen = 0;
                }
                if (!attrs.min) {
                    attrs.min = "";
                }
                if (!attrs.controlClass) {
                    attrs.controlClass = ""
                }
                if (!attrs.placeholder) {
                    attrs.placeholder = ""
                }

                if (!attrs.isTabNext) {
                    attrs.isTabNext = "false"
                }
                if (!attrs.isBackPrev) {
                    attrs.isBackPrev = "false"
                }
                if (!attrs.allowZero) {
                    attrs.allowZero = "false"
                }
                if (!attrs.allowEmpty) {
                    attrs.allowEmpty = "false"
                }
                if (!attrs.errorMessage) {
                    attrs.errorMessage = "out of range"
                }

                return this.link;
            },
            link: function (scope, element, attrs) {
                scope.validate = (scope.validate || scope.validate === undefined);
                if (!scope.inputrangeid) {
                    scope.inputrangeid = _.uniqueId();
                    attrs.inputrangeid = scope.inputrangeid;
                }
                element.find('input').attr('id', "kInputRange_" + scope.inputrangeid);
                 var oldVal;
                var negative;
                var oldValToListen = null;
                var intervalObj = null;
//                var min, max;

                scope.$watch('initVal', function (val) {
                    if (!isNaN(val) && val != "") {
                        scope.value = parseInt(val);
                        validateData(val);

                        // min = parseInt(scope.min);
                        // max = parseInt(scope.max);
                        oldVal = scope.value;
                        negative = (scope.min === "" || scope.min < 0);
                    }
                });

                scope.$watch('inputrangeid', function (val) {
                    //$("#kInputRange_" + scope.inputrangeid).on('keydown', keydownpress);
                    //$("#kInputRange_" + scope.inputrangeid).on('keyup', keyup);
                    //$("#kInputRange_" + scope.inputrangeid).on('input', validateInputchange);
                });

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

var validateData = function(val){
    if ((scope.max !== "" && parseInt(val, 10) > parseInt(scope.max, 10)) || (scope.min !== "" && parseInt(val, 10) < parseInt(scope.min, 10) )) {
        //element.children('.kInputRange')[0].classList.add('error')
        addClass(element.children()[0], 'error');
        addClass(element.children()[0].getElementsByTagName('input')[0], 'error');
        addClass(element.parents('.kUpDownRange')[0], 'error');
        addClass(element.parents('.kInputSet')[0], 'error');
        //$("#kInputRange_" + scope.inputrangeid).addClass('error');
        //$("#kInputRange_" + scope.inputrangeid).parents('.kUpDownRange').addClass('error');
        //$("#kInputRange_" + scope.inputrangeid).parents('.kInputSet').addClass('error');
    }
    else {
        //element.children('.kInputRange')[0].classList.remove('error');
        removeClass(element.children()[0], 'error');
        removeClass(element.children()[0].getElementsByTagName('input')[0], 'error');
        removeClass(element.parents('.kUpDownRange')[0], 'error');
        removeClass(element.parents('.kInputSet')[0], 'error');
        //element.children()[0].getElementsByTagName('input')[0].classList.remove('error');
        //element.parents('.kUpDownRange')[0].classList.remove('error')
        //element.parents('.kInputSet')[0].classList.remove('error');
        //$("#kInputRange_" + scope.inputrangeid).removeClass('error');
        //$("#kInputRange_" + scope.inputrangeid).parents('.kUpDownRange').removeClass('error');
        //$("#kInputRange_" + scope.inputrangeid).parents('.kInputSet').removeClass('error');
    }

};
                scope.$watch('value', function (val) {
                    //val = parseIntOrEmpty(val);//Added by FA
                    //$("#kInputRange_" + scope.inputrangeid).val(val);
                    validateData(val);
                    shiftSpanLeft(element);
                });

                scope.$watch("min", function (val) {
                    //val = parseIntOrEmpty(val);//Added by FA
                    //$("#kInputRange_" + scope.inputrangeid).val(val);
                    validateData( scope.value );
                    //shiftSpanLeft(element);
                });

                scope.$watch("max", function (val) {
                    //val = parseIntOrEmpty(val);//Added by FA
                    //$("#kInputRange_" + scope.inputrangeid).val(val);
                    validateData( scope.value );
                    //shiftSpanLeft(element);
                });


                scope.validateInputchange = function (e) {

                    negative = (scope.min === "" || scope.min < 0);
                    //e.currentTarget.classList.remove('error');
                    element[0].children[0].classList.remove('error');

                    scope.value = scope.value.replace(/[^\d-]/g, '').trim();
                    var isLegal = true;

                    var valueToSet;

                    if ((scope.value == "-" && negative) || (scope.value == "" && scope.allowEmpty == "false")) {
                        oldVal = scope.value;
                        //e.currentTarget.classList.add('error');
                        element[0].children[0].classList.add('error');
                    }

                    else {
                        isLegal = negative ? (!isNaN(scope.value) ) : (!isNaN(scope.value) && scope.value != "-");
                        if (isLegal) {
                            if (utils.isTrue(scope.isTabNext))//if string length big the max string length trigger tab next
                            {
                                if (scope.value.length >= scope.max.toString().length) {
                                    var nextInput = document.getElementById("kInputRange_" + (parseInt(scope.inputrangeid) + 1));
                                    nextInput.focus();
                                    nextInput.setSelectionRange(0, nextInput.value.length);
                                    if (scope.value.length > scope.max.toString().length) {
                                        scope.value = oldVal;
                                        return;
                                    }
                                }
                            }

                            if (scope.max !== "" && parseIntOrEmpty(scope.value) > scope.max   && scope.validate) {
                                valueToSet = oldVal = scope.max;
                            }
                            else if (scope.min !== "" && parseIntOrEmpty(scope.value) < scope.min  && scope.validate) {
                                valueToSet = oldVal = scope.min;
                            }
                            else {
                                valueToSet = oldVal = parseInt(scope.value);
                            }
                            //$timeout(function ()
                            //{
                            //    scope.$apply(function ()
                            //        {
                            if (utils.isTrue(scope.allowZero)) {

                                var leadingZero = valueToSet.length - parseIntOrEmpty(valueToSet).toString().length;
                                var zeros = "";
                                for (var i = 0; i < leadingZero; i++) {
                                    zeros += "0";
                                }
                                scope.value = zeros + parseIntOrEmpty(valueToSet);
                            }
                            else {
                                scope.value = parseIntOrEmpty(valueToSet);
                            }

                            //$("#kInputRange_" + scope.inputrangeid).val(scope.value);
                            if (oldValToListen != scope.value) {
                                oldValToListen = scope.valueToListen = scope.value;
                            }
                            //}
                            //)
                            //;
                            //}, 0)
                        }
                        else {
                            //valueToSet = $(this).val(oldVal);
                            valueToSet = oldVal;
                            scope.value = valueToSet;
                        }

                    }
                };

                var parseIntOrEmpty = function (val) {
                    if (isNaN(parseInt(val))) {
                        return "";
                    }
                    else {
                        return parseInt(val);
                    }
                };

                // var allowedKeys = [8,13,38,40,33,34,35,36,37,38,39,40,12,45,48,49,50,51,52,53,54,55,56,57];
                scope.keydownpress = function (e) {
                    var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
                    if (key == 38 || key == 40) {
                        if (scope.max !== "")
                            scope.value = Math.min(scope.value, scope.max);//Added by FA when value is changed outside the object
                        if (scope.min !== "")
                            scope.value = Math.max(scope.value, scope.min);//the test must be done here

                        if (key == 38)//arrow up
                        {
                            if (scope.max === "" || scope.value < scope.max || scope.value === "") {
                                //scope.$apply(function ()
                                //{
                                if (scope.value === "") {
                                    if (scope.min !== "") {
                                        scope.value = scope.min;
                                    }
                                }
                                else {
                                    scope.value = parseInt(scope.value) + 1;
                                }
                                // scope.value = scope.value === "" ? scope.min : parseInt(scope.value) + 1;
                                //});
                            }
                        }
                        else if (key == 40)//arrow down
                        {
                            if (scope.min === "" || scope.value > scope.min || scope.value === "") {
                                //scope.$apply(function ()
                                //{
                                if (scope.value === "") {
                                    if (scope.max !== "") {
                                        scope.value = scope.max;
                                    }
                                }
                                else {
                                    scope.value = parseInt(scope.value) - 1;
                                }
                                // scope.value = scope.value === "" ? scope.min : parseInt(scope.value) - 1;
                                //});
                            }
                        }
                        if (intervalObj == null) {
                            intervalObj = $interval(function () {
                                $timeout(function () {
                                    scope.$apply(function () {
                                        if (oldValToListen != scope.value) {
                                            oldValToListen = scope.valueToListen = scope.value;
                                        }
                                    });
                                }, 0)
                            }, scope.timeout);
                        }
                    }


                    if (key == 13)//Enter
                    {
                        scope.enterClick();
                    }
                };

                scope.keyup = function (e) {
                    var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
                    if (key == 38 || key == 40) {
                        $timeout(function () {
                            //scope.$apply(function ()
                            //{
                            if (oldValToListen != scope.value) {
                                oldValToListen = scope.valueToListen = scope.value;
                            }
                            //});
                        }, 0);

                        if (intervalObj) $interval.cancel(intervalObj);
                        intervalObj = null;
                    }

                    if (key == 8)//backSpace
                    {
                        if (utils.isTrue(scope.isBackPrev)) {

                            if (element[0].getElementsByTagName('input')[0].value == "0")//if input is empty go to prev input
                            {
                                var prevInput = document.getElementById("kInputRange_" + (parseInt(scope.inputrangeid) - 1));
                                prevInput.focus();
                                //prevInput.setSelectionRange(0, prevInput.value.length);
                            }
                        }
                    }

                };

                scope.$on("$destroy", function () {
                    if (intervalObj) $interval.cancel(intervalObj);
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
                    iDummy.textContent = scope.value;
                    ele.find('.kUnit').css('left', (iDummy.offsetWidth + 5 ) + 'px');
                };


            }
        };
    }]);
})();