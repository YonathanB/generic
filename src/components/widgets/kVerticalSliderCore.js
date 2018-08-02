/***********************************************
 * File Name: kVerticalSliderCore.js
 * Created by: Chezi Hoyzer
 * On: 21/09/2014  13:18
 * Last Modified: 21/09/2014
 * Modified by: Choyzer
 ***********************************************/
(function ()
    {
        angular.module('components.widgets').directive("kVerticalSliderCore", ['$timeout', function ($timeout)
            {
                return {
                    restrict: 'E',
                    scope: {
                        vslidercoreid: '@',
                        value: '=',
                        valuetolisten: '=',
                        timeout: '@',
                        listenOnMove: '@',
                        enabled: '=',
                        width: '@',
                        height: '@',
                        max: '@',
                        min: '@',
                        backgroundColorClass: '@',
                        knoobActiveColorClass: '@',
                        knoobDisableColorClass: '@',
                        knoobIconsBigClass: '@',
                        knoobIconsMedClass: '@',
                        knoobIconsSmallClass: '@',
                        controlClass: '@'
                    },
                    template: "<div ng-class='controlClass' ng-attr-style='width:{{width*2}}px'>\
                                <div ng-attr-style='width:{{width}}px; margin: 0 auto;'>\
                                  <canvas  width='{{width}}' height='{{height}}' id='kVerticalSliderCoreCanvas_{{vslidercoreid}}'></canvas>\
                                </div>\
                       </div>",
                    compile: function (element, attrs)
                        {
                            if (!attrs.vslidercoreid)
                                { attrs.vslidercoreid = _.uniqueId() }
                            if (!attrs.timeout)
                                { attrs.timeout = 500; }
                            if (!attrs.listenOnMove)
                                { attrs.listenOnMove = "true"; }
                            if (!attrs.enabled)
                                { attrs.enabled = "true" }
                            if (!attrs.width)
                                { attrs.width = 24 }
                            if (!attrs.height)
                                { attrs.height = 310 }
                            if (!attrs.max)
                                { attrs.max = 1000 }
                            if (!attrs.min)
                                { attrs.min = -1000 }
                            if (!attrs.value)
                                { attrs.value = 0; }
                            if (!attrs.valuetolisten)
                                { attrs.valuetolisten = 0; }
                            if (!attrs.knoobActiveColorClass)
                                { attrs.knoobActiveColorClass = "app-main-background-color" }
                            if (!attrs.knoobDisableColorClass)
                                { attrs.knoobDisableColorClass = "app-disable-background-color" }
                            if (!attrs.backgroundColorClass)
                                { attrs.backgroundColorClass = "app-secondary-background-color" }
                            //if (!attrs.titleText)
                            //    { attrs.titleText = "Volume" }
                            if (!attrs.knoobIconsBigClass)
                                { attrs.knoobIconsBigClass = "icon_knoob" }
                            if (!attrs.knoobIconsMedClass)
                                { attrs.knoobIconsMedClass = "icon_knoob" }
                            if (!attrs.knoobIconsSmallClass)
                                { attrs.knoobIconsSmallClass = "icon_knoob" }
                            if (!attrs.controlClass)
                                { attrs.controlClass = "" }

                            return this.link;
                        },
                    link: function (scope, element, attrs)
                        {
                            var isInitFinish = false;
                            var isMouseDown = false;
                            var canSendFlag = true;
                            var timer = null;
                            var knoobPosition = 0;
                            var knoobHight = 45;
                            var knoobImage;
                            var changeInternal = false;

                            var backgroundColor = null;
                            var knoobActiveColor = null;
                            var knoobDisableColor = null;

                            var arr = ["vslidercoreid", "value", "valuetimeout", "enabled", "width", "height", "max", "min", "activeColor", "disableColor", "backgroundColorClass", "titleText", "knoobIconsBigClass", "knoobIconsMedClass", "knoobIconsSmallClass"];
                            for (var i = 0, cnt = arr.length; i < arr.length; i++)
                                {
                                    scope.$watch(arr[i], function ()
                                    {
                                        cnt--;
                                        if (cnt <= 0 && !isInitFinish)
                                            {
                                                isInitFinish = true;
                                                initControl()
                                            }
                                    });
                                }


                            var initControl = function ()
                                {
                                    scope.canvas = $("#kVerticalSliderCoreCanvas_" + scope.vslidercoreid)[0];
                                    scope.context = scope.canvas.getContext('2d');
                                    knoobImage = getKnoobImage();
                                    draw();
                                };


                            scope.$watch('value', function (newVal, oldVal)
                            {

//                           if (changeInternal) return changeInternal = false; //not working if changing the value via input (need to know why)
                                setKnoobPosition(newVal);
                                $("#kVerticalSliderCoreCanvas_" + scope.vslidercoreid).attr('title', scope.value);
                            });
//
//                        scope.$watch('valuetolisten', function (newVal, oldVal)
//                        {
//                            $timeout(function ()
//                            {
//                                scope.$apply(function ()
//                                {
//                                    scope.value = scope.valuetolisten;
//                                });
//                            }, 0)
//
//                        });

                            scope.$watch('min', function (newVal, oldVal)
                            {
                                scope.min = parseInt(scope.min);
                            });

                            scope.$watch('max', function (newVal, oldVal)
                            {
                                scope.max = parseInt(scope.max);
                            });


                            scope.$watch('knoobActiveColorClass', function (newVal, oldVal)
                            {
                                knoobActiveColor = utils.getClassProperty("background-color", scope.knoobActiveColorClass);
                            });
                            scope.$watch('knoobDisableColorClass', function (newVal, oldVal)
                            {
                                knoobDisableColor = utils.getClassProperty("background-color", scope.knoobDisableColorClass);

                            });
                            scope.$watch('backgroundColorClass', function (newVal, oldVal)
                            {
                                backgroundColor = utils.getClassProperty("background-color", scope.backgroundColorClass);
                            });


                            scope.$watch('enabled', function (val)
                            {
                                if (val)
                                    {
                                        $("#kVerticalSliderCoreCanvas_" + scope.vslidercoreid).attr('title', scope.value);
                                    }
                                else
                                    {
                                        $("#kVerticalSliderCoreCanvas_" + scope.vslidercoreid).attr('title', "Control is disabled");
                                    }
                                if (isInitFinish)
                                    {
                                        draw();
                                    }
                            });


                            scope.$watch('vslidercoreid', function (val)
                            {

                                //slider canvas
                                $("#kVerticalSliderCoreCanvas_" + scope.vslidercoreid).on('touchstart mousedown', mouseDown);
                                $("#kVerticalSliderCoreCanvas_" + scope.vslidercoreid).on('mouseup', mouseUp);
                                $("#kVerticalSliderCoreCanvas_" + scope.vslidercoreid).on('mouseout', mouseOut);
                                $("#kVerticalSliderCoreCanvas_" + scope.vslidercoreid).on('touchmove mousemove', mouseMove);
                                $("#kVerticalSliderCoreCanvas_" + scope.vslidercoreid).on('touchend', function (e)
                                {
                                    mouseUp(e);
                                    mouseOut(e);
                                });

                                //$("#kVerticalSliderCoreCanvas_" + scope.vslidercoreid).on('mousewheel', function (e)
                                //{
                                //    mouseWheel(e)
                                //    return false
                                //}, false);
                                // IE9, Chrome, Safari, Opera
                                $("#kVerticalSliderCoreCanvas_" + scope.vslidercoreid)[0].addEventListener("mousewheel", function (e)
                                {
                                    mouseWheel(e);
                                    e.preventDefault();
                                }, false);
                                // Firefox
                                $("#kVerticalSliderCoreCanvas_" + scope.vslidercoreid)[0].addEventListener("DOMMouseScroll", function (e)
                                {
                                    mouseWheel(e);
                                    e.preventDefault();
                                }, false);


                            });


                            var draw = function ()
                                {

                                    scope.context.fillStyle = backgroundColor;
                                    scope.context.roundRect(0, 0, scope.width, scope.height, 5);
                                    scope.context.fill();

                                    if (!scope.enabled)
                                        {
                                            scope.context.fillStyle = knoobDisableColor;
                                        }
                                    else
                                        {
                                            scope.context.fillStyle = knoobActiveColor;
                                        }

                                    scope.context.roundRect(0, knoobPosition, scope.width, knoobHight, 5);
                                    scope.context.fill();
                                    //context.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);

                                    //mg	Specifies the image, canvas, or video element to use
                                    //sx	Optional. The x coordinate where to start clipping
                                    //sy	Optional. The y coordinate where to start clipping
                                    //swidth	Optional. The width of the clipped image
                                    //sheight	Optional. The height of the clipped image
                                    //x	The x coordinate where to place the image on the canvas
                                    //y	The y coordinate where to place the image on the canvas
                                    //width	Optional. The width of the image to use (stretch or reduce the image)
                                    //height	Optional. The height of the image to use (stretch or reduce the image)
                                    scope.context.drawImage(knoobImage.image, knoobImage.top, knoobImage.left, 15, 24, 5, knoobPosition + 10, 15, 24);
                                }

                            var getKnoobImage = function ()
                                {
                                    var knoobImage = {};
                                    knoobImage.image = new Image();
                                    knoobImage.image.src = "spritesheet.png";

                                    //if (!attrs.knoobIconsBigClass) { attrs.knoobIconsBigClass = "icon_knoob" }
                                    //if (!attrs.knoobIconsMedClass) { attrs.knoobIconsMedClass = "icon_knoob" }
                                    //if (!attrs.knoobIconsSmallClass) { attrs.knoobIconsSmallClass = "icon_knoob" }

                                    var selectedIcon = (scope.width <= 16) ? scope.knoobIconsSmallClass : (scope.width > 16 && scope.width <= 20) ? scope.knoobIconsMedClass : scope.knoobIconsBigClass;
                                    var pos = utils.getClassProperty('background-position', selectedIcon);
                                    knoobImage.top = parseInt(pos.split(' ')[0]) * -1;
                                    knoobImage.left = parseInt(pos.split(' ')[1]) * -1;

                                    return knoobImage;
                                }

                            var mouseWheel = function (e)
                                {
                                    // cross-browser wheel delta
                                    var e = window.event || e; // old IE support
                                    var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

                                    if (scope.enabled)
                                        {
                                            $timeout(function ()
                                            {
                                                scope.$apply(function ()
                                                {
                                                    scope.valuetolisten = scope.value = scope.value + delta;
                                                });
                                            })
                                        }

                                };


                            var mouseDown = function (e)
                                {
                                    if (utils.isRightClick(e))
                                        {
                                            return;
                                        }
                                    var mousePos = utils.getMousePos(scope.canvas, e);


                                    isMouseDown = scope.enabled;

                                    if (isMouseDown)
                                        {
                                            knoobPosition = mousePos.y - 22;
                                            if (knoobPosition < 0) knoobPosition = 0;
                                            if (knoobPosition > scope.height - knoobHight) knoobPosition = scope.height - knoobHight;

                                            setValue();
                                            draw();
                                        }


                                };

                            var mouseUp = function ()
                                {
                                    if (scope.enabled)
                                        {
                                            //need $timeout because "$digest already in progress" problem
                                            $timeout(function ()
                                            {
                                                scope.$apply(function ()
                                                {
                                                    scope.valuetolisten = scope.value;
                                                    isMouseDown = false;
                                                });
                                            }, 0)
                                        }
                                };


                            var mouseOut = function ()
                                {
                                    if (isMouseDown && scope.enabled)
                                        {
                                            //need $timeout because "$digest already in progress" problem
                                            $timeout(function ()
                                            {
                                                scope.$apply(function ()
                                                {
                                                    scope.valuetolisten = scope.value;
                                                    isMouseDown = false;
                                                });
                                            }, 0)
                                        }
                                };


                            var mouseMove = function (e)
                                {
                                    var mousePos = utils.getMousePos(scope.canvas, e);

                                    if (isMouseDown && scope.enabled)
                                        {
                                            knoobPosition = mousePos.y - 22;
                                            if (knoobPosition < 0) knoobPosition = 0;
                                            if (knoobPosition > scope.height - knoobHight) knoobPosition = scope.height - knoobHight;

                                            setValue();
                                            draw();

                                            if (scope.listenOnMove)
                                                {
                                                    if (timer == null)
                                                        {
                                                            timer = $timeout(function ()
                                                            {
                                                                canSendFlag = true;
                                                            }, scope.timeout)
                                                        }

                                                    if (canSendFlag)
                                                        {

                                                            canSendFlag = false;
                                                            scope.$apply(function ()
                                                            {
                                                                scope.valuetolisten = scope.value;
                                                                timer = null;
                                                            });

                                                        }
                                                }
                                        }
                                };


                            var setValue = function ()
                                {
                                    var controlValueRange = scope.max - scope.min;
                                    var controlValuePrecent = 1 - parseFloat(knoobPosition) / parseFloat(scope.height - knoobHight);

                                    $timeout(function ()
                                    {
                                        scope.$apply(function ()
                                        {
                                            changeInternal = true;
                                            scope.value = parseInt(scope.min + (controlValuePrecent * controlValueRange));
                                        });
                                    }, 0)

                                };

                            var setKnoobPosition = function (val)
                                {
                                    if (isNaN(val)) val = scope.min;
                                    if (val < scope.min) val = scope.min;
                                    if (val > scope.max) val = scope.max;
                                    var controlValueRange = scope.max - scope.min;
                                    var knoobPositionpercent = 1 - parseFloat(parseFloat(Math.abs(val - scope.min)) / parseFloat(controlValueRange));
                                    knoobPosition = parseInt(parseFloat(knoobPositionpercent) * parseFloat(scope.height - knoobHight));
                                    draw();
                                }


                        }
                };
            }]);
    })();