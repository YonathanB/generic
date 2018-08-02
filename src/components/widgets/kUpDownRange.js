(function () {
    angular.module('components.widgets').directive("kUpDownRange", ['$timeout', '$interval', function ($timeout, $interval) {
        return {
            restrict: 'E',
            scope: {
                initVal: '@',
                value: '=',
                valueToListen: '=',
                enabled: '=',
                updownid: '@',
                timeout: '@',
                max: '@',
                min: '@',
                controlInputClass: '@',
                controlClass: '@',
                placeholder: '@',
                unit: '@',
                title: '@',
                enterClick: '&',
                decimals: '@',
                roundingTo: '@',
                steps: '@',
                validateOnArrow: '=',
                validateOnEnter: '='

            },
            template: "<div class='kUpDownRange {{controlClass}}' ng-class='{disabled : !enabled }'>\
                            <k-input-range enter-click='enterClick()' allow-empty='false' unit='{{unit}}' init-val='{{initVal}}' timeout='{{timeout}}' placeholder='{{placeholder}}' control-class='{{controlInputClass}}' value-to-listen='valueToListen' enabled='enabled'  value='value'   max='{{max}}'  min='{{min}}' title='{{title}}'></k-input-range >\
                            <div class='kUpDownRange-arrows'>\
                                <div id='kUpDownRangeUp_{{updownid}}' class='kUpDownRangeUp' ng-mousedown='arrowUpMouseDown($event)' ng-mouseup='arrowUpMouseUp($event)' title='Up'>\
                                    <div class='kUpDownRange-arrowUp'></div>\
                                </div>\
                                <div id='kUpDownRangeDown_{{updownid}}' class='kUpDownRangeDown' ng-mousedown='arrowDownMouseDown($event)' ng-mouseup='arrowDownMouseUp($event)' title='Down'>\
                                    <div class='kUpDownRange-arrowDown'></div>\
                                </div>\
                            </div>\
                       </div>",
            compile: function (element, attrs) {
                if (!attrs.enabled) {
                    attrs.enabled = "true";
                }
                if (!attrs.updownid) {
                    attrs.updownid = _.uniqueId()
                }
                if (!attrs.width) {
                    attrs.width = 138;
                }
                if (!attrs.height) {
                    attrs.height = 16;
                }
                if (!attrs.max) {
                    attrs.max = 600
                }
                if (!attrs.min) {
                    attrs.min = -500
                }
                if (!attrs.value) {
                    attrs.value = "0";
                }
                if (!attrs.valueToListen) {
                    attrs.valueToListen = "void";
                }
                if (!attrs.timeout) {
                    attrs.timeout = 500;
                }
                if (!attrs.controlInputClass) {
                    attrs.controlInputClass = ""
                }
                if (!attrs.placeholder) {
                    attrs.placeholder = ""
                }

                if (!attrs.unit) {
                    attrs.unit = ""
                }
                if (!attrs.decimals) {
                    attrs.decimals = "0";
                }
                if (!attrs.roundingTo) {
                    attrs.roundingTo = "0"
                }
                if (!attrs.steps) {
                    attrs.steps = "1"
                }
                if (!attrs.validateOnEnter) {
                    attrs.validateOnEnter = "false"
                }
                if (!attrs.validateOnArrow) {
                    attrs.validateOnArrow = "false"
                }

                return this.link;
            },
            link: function (scope, element, attrs) {
                var isInitFinish = false;
                var timerIntervalMax = 500;
                var timerIntervalMin = 50;
                var min;
                var max;
                var timeoutObj = null;
                var intervalObj = null;
                //scope.$watch('updownid', function (val) {
                //    $("#kUpDownRangeUp_" + scope.updownid).on("mousedown", arrowUpMouseDown)
                //    $("#kUpDownRangeUp_" + scope.updownid).on("mouseup mouseout", arrowUpMouseUp)
                //    $("#kUpDownRangeDown_" + scope.updownid).on("mousedown", arrowDownMouseDown)
                //    $("#kUpDownRangeDown_" + scope.updownid).on("mouseup mouseout", arrowDownMouseUp)
                //});

                //scope.$watch('value', function (val) {
                //    shiftSpanLeft(element);
                //});


                scope.arrowUpMouseDown = function (e) {
                    if (!scope.enabled) return;
                    if (utils.isRightClick(e)) return;
                    //$("#kUpDownRangeUp_" + scope.updownid).css({'opacity': 0.7});
                    arrow = element.children().find('.kUpDownRangeUp')[0];
                    arrow.style.opacity = "0.7";
                    controlClick("up", function () {
                        startClicktimeout("up", timerIntervalMax, 1);
                    }, 1);
                    if (intervalObj == null) {
                        intervalObj = $interval(function () {
                            //$timeout(function () {
                            //    scope.$apply(function () {
                            scope.valueToListen = scope.value;
                            //});
                            //}, 0)
                        }, scope.timeout);
                    }
                };

                scope.arrowUpMouseUp = function (e) {
                    if (!scope.enabled) return;
                    if (utils.isRightClick(e)) return;
//                    $("#kUpDownRangeUp_" + scope.updownid).css({'opacity': 1});
                    arrow = element.children().find('.kUpDownRangeUp')[0];
                    arrow.style.opacity = "1";
                    if (timeoutObj) $timeout.cancel(timeoutObj);
                    //$timeout(function () {
                    //    scope.$apply(function () {
                    scope.valueToListen = scope.value;
                    //});
                    //}, 0);
                    if (intervalObj) $interval.cancel(intervalObj);
                    intervalObj = null;
                };

                scope.arrowDownMouseDown = function (e) {
                    if (!scope.enabled) return;
                    if (utils.isRightClick(e)) return;
                    //$("#kUpDownRangeDown_" + scope.updownid).css({'opacity': 0.7});
                    arrow = element.children().find('.kUpDownRangeDown')[0];
                    arrow.style.opacity = "0.7";
                    controlClick("down", function () {
                        startClicktimeout("down", timerIntervalMax, 1);
                    }, 1);
                    if (intervalObj == null) {
                        intervalObj = $interval(function () {
                            //$timeout(function () {
                            //    scope.$apply(function () {
                            scope.valueToListen = scope.value;
                            //});
                            //}, 0)
                        }, scope.timeout);
                    }

                };

                scope.arrowDownMouseUp = function (e) {
                    if (!scope.enabled) return;
                    if (utils.isRightClick(e)) return;
                    //$("#kUpDownRangeDown_" + scope.updownid).css({'opacity': 1});
                    arrow = element.children().find('.kUpDownRangeDown')[0];
                    arrow.style.opacity = "1";
                    if (timeoutObj) $timeout.cancel(timeoutObj);
                    //$timeout(function () {
                    //    scope.$apply(function () {
                    scope.valueToListen = scope.value;
                    //});
                    //}, 0);
                    if (intervalObj) $interval.cancel(intervalObj);
                    intervalObj = null;
                };


                scope.$watch('min', function (val) {
                    min = parseInt(scope.min);
                });

                scope.$watch('max', function (val) {
                    max = parseInt(scope.max);
                });


                var controlClick = function (arrowType, callBack, factor) {
                    if (arrowType == "up") {
                        if (scope.value < max) {
                            //scope.$apply(function () {
                            if (typeof scope.value !== "number") {
                                scope.value = 0;
                            }
                            scope.value = (scope.value + 1 * factor) > max ? max : (scope.value + 1 * factor);
                            callBack();
                            //});
                        }
                    }
                    else {
                        if (scope.value > min) {
                            //scope.$apply(function () {
                            if (typeof scope.value !== "number") {
                                scope.value = 0;
                            }
                            scope.value = (scope.value - 1 * factor) < min ? min : (scope.value - 1 * factor);
                            callBack();
                            //});
                        }
                    }
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


                //var shiftSpanLeft = function (ele) {
                //    var iDummy = document.getElementById("dummyString");
                //    if (iDummy === null) {
                //        iDummy = document.createElement("span");
                //        iDummy.setAttribute("id", "dummyString");
                //        iDummy.style.visibility = "hidden";// .display = "none"; doesn't work
                //        document.body.appendChild(iDummy);
                //    }
                //    var iFontName = ele.find('input').css('font-family');
                //    var iFontSize = ele.find('input').css('font-size');
                //
                //    iDummy.style.fontSize = iFontSize;
                //    iDummy.style.fontFamily = iFontName;
                //    iDummy.textContent = scope.value;
                //    ele.find('span').css('left', (iDummy.offsetWidth + 5 ) + 'px');
                //};
                //

                scope.$on("$destroy", function () {
                    if (intervalObj) $interval.cancel(intervalObj);
                    intervalObj = null;
                });
            }
        };
    }]);
})();