/***********************************************
 * File Name: kHorizontalSliderCore.js
 * Created by: Chezi Hoyzer
 * On: 21/09/2014  14:07
 * Last Modified: 21/09/2014
 * Modified by: Choyzer
 ***********************************************/
(function ()
    {
        angular.module('components.widgets').directive("kHorizontalSliderCore", ['$timeout', function ($timeout)
            {
                return {
                    restrict: 'E',
                    scope: {
                        hslidercoreid: '@',
                        value: '=',
                        valuetolisten: '=',
                        timeout: '@',
                        listenOnMove: '@',
                        enabled: '=',
                        width: '@',
                        height: '@',
                        max: '@',
                        min: '@',
                        lineColor: '@',
                        knoobIconNormal: '@',
                        knoobIconOver: '@'
                    },
                    template: "<canvas  width='{{width}}' height='{{height}}' id='kHorizontalSliderCoreCanvas_{{hslidercoreid}}'></canvas>",
                    compile: function (element, attrs)
                        {
                            if (!attrs.hslidercoreid)
                                { attrs.hslidercoreid = _.uniqueId(); }
                            if (!attrs.value)
                                { attrs.value = 100; }
                            if (!attrs.valuetolisten)
                                { attrs.valuetolisten = 100; }
                            if (!attrs.timeout)
                                { attrs.timeout = 200; }
                            if (!attrs.listenOnMove)
                                { attrs.listenOnMove = true; }
                            if (!attrs.enabled)
                                { attrs.enabled = true }
                            if (!attrs.width)
                                { attrs.width = 180 }
                            if (!attrs.height)
                                { attrs.height = 20 }
                            if (!attrs.max)
                                { attrs.max = 50 }
                            if (!attrs.min)
                                { attrs.min = -50 }
                            if (!attrs.lineColor)
                                { attrs.lineColor = "#868695" }
                            if (!attrs.knoobIconNormal)
                                { attrs.knoobIconNormal = "icon_bullet" }
                            if (!attrs.knoobIconOver)
                                { attrs.knoobIconOver = "icon_bulletOver" }

                            return this.link;
                        },
                    link: function (scope, element, attrs)
                        {
                            var isInitFinish = false;
                            var isMouseDown = false;
                            var isMouseOver = false;
                            var canSendFlag = true;
                            var timer = null;
                            var bulletDiameter = 15;
                            var bulletRadius = 7;
                            var bulletPosition = 0;
                            var knoobImage;
                            var changeInternal = false;


                            var arr = ["hslidercoreid", "value", "valuetolisten", "listenOnMove", "enabled", "width", "height", "max", "min", "backgroundColor", "knoobIconNormal", "knoobIconOver"];
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
                                    //createSlider();
                                    scope.canvas = $("#kHorizontalSliderCoreCanvas_" + scope.hslidercoreid)[0];
                                    scope.context = scope.canvas.getContext('2d');
                                    knoobImage = getKnoobImage();
                                    draw();
                                };


                            scope.$watch('value', function (newVal, oldVal)
                            {
                                //if (newVal != oldVal)
                                //{
                                if (changeInternal) return changeInternal = false;
                                setKnoobPosition(newVal);
                                //}

                            });


                            scope.$watch('min', function (newVal, oldVal)
                            {
                                scope.min = parseInt(scope.min);
                            });

                            scope.$watch('max', function (newVal, oldVal)
                            {
                                scope.max = parseInt(scope.max);
                            });


                            scope.$watch('enabled', function (val)
                            {
                                if (val)
                                    {
                                        $("#kHorizontalSliderCoreCanvas_" + scope.hslidercoreid).attr('title', scope.value);
                                    }
                                else
                                    {
                                        $("#kHorizontalSliderCoreCanvas_" + scope.hslidercoreid).attr('title', "Control is disabled");
                                    }
                                if (isInitFinish)
                                    {
                                        draw();
                                    }
                            });


                            scope.$watch('hslidercoreid', function (val)
                            {

                                //slider canvas
                                $("#kHorizontalSliderCoreCanvas_" + scope.hslidercoreid).on('touchstart mousedown', mouseDown);
                                $("#kHorizontalSliderCoreCanvas_" + scope.hslidercoreid).on('mouseup', mouseUp);
                                $("#kHorizontalSliderCoreCanvas_" + scope.hslidercoreid).on('mouseout', mouseOut);
                                $("#kHorizontalSliderCoreCanvas_" + scope.hslidercoreid).on('touchmove mousemove', mouseMove);
                                $("#kHorizontalSliderCoreCanvas_" + scope.hslidercoreid).on('touchend', function (e)
                                {
                                    mouseUp(e);
                                    mouseOut(e);
                                });

                            });


                            var draw = function ()
                                {

                                    scope.context.clearRect(0, 0, (scope.width + 5), scope.height);
                                    var hcenter = scope.height / 2;

                                    scope.context.beginPath();
                                    scope.context.moveTo(bulletRadius, hcenter);
                                    scope.context.lineTo(scope.width - (bulletRadius), hcenter);
                                    scope.context.strokeStyle = scope.lineColor;
                                    scope.context.stroke();

                                    if (scope.enabled)
                                        {
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
                                            if (isMouseOver)
                                                {
                                                    scope.context.drawImage(knoobImage.image, knoobImage.topOver, knoobImage.leftOver, bulletDiameter, bulletDiameter, bulletPosition, hcenter - bulletRadius, bulletDiameter, bulletDiameter);
                                                }
                                            else
                                                {
                                                    scope.context.drawImage(knoobImage.image, knoobImage.topNormal, knoobImage.leftNormal, bulletDiameter, bulletDiameter, bulletPosition, hcenter - bulletRadius, bulletDiameter, bulletDiameter);
                                                }
                                        }
                                    else
                                        {
                                            scope.context.globalAlpha = 0.5;
                                            scope.context.drawImage(knoobImage.image, knoobImage.topNormal, knoobImage.leftNormal, bulletDiameter, bulletDiameter, bulletPosition, hcenter - bulletRadius, bulletDiameter, bulletDiameter);
                                            scope.context.globalAlpha = 1;
                                        }
                                };

                            var getKnoobImage = function ()
                                {
                                    var knoobImage = {};
                                    knoobImage.image = new Image();
                                    knoobImage.image.src = "spritesheet.png";

                                    var posNormal = utils.getClassProperty('background-position', scope.knoobIconNormal);
                                    knoobImage.topNormal = parseInt(posNormal.split(' ')[0]) * -1;
                                    knoobImage.leftNormal = parseInt(posNormal.split(' ')[1]) * -1;

                                    var posOver = utils.getClassProperty('background-position', scope.knoobIconOver);
                                    knoobImage.topOver = parseInt(posOver.split(' ')[0]) * -1;
                                    knoobImage.leftOver = parseInt(posOver.split(' ')[1]) * -1;

                                    return knoobImage;
                                };


                            var mouseDown = function (e)
                                {
                                    var mousePos = utils.getMousePos(scope.canvas, e);
                                    if (utils.isRightClick(e))
                                        {
                                            return;
                                        }
                                    isMouseDown = scope.enabled;
                                    if (isMouseDown)
                                        {
                                            if (mousePos.x - bulletRadius > 0 && mousePos.x + bulletRadius < scope.width)
                                                {
                                                    bulletPosition = mousePos.x - bulletRadius;
                                                }
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
                                    isMouseOver = false;
                                    draw();
                                };


                            var mouseMove = function (e)
                                {
                                    var mousePos = utils.getMousePos(scope.canvas, e);
                                    isMouseOver = true;
                                    if (isMouseDown && scope.enabled)
                                        {
                                            if (mousePos.x - bulletRadius > 0 && mousePos.x + bulletRadius < scope.width)
                                                {
                                                    bulletPosition = mousePos.x - bulletRadius;
                                                }
                                            if (mousePos.x - bulletRadius < 0)
                                                {
                                                    bulletPosition = 0;
                                                }
                                            if ((mousePos.x - bulletRadius) > (scope.width - bulletDiameter))
                                                {
                                                    bulletPosition = scope.width - bulletDiameter;
                                                }

                                            setValue();


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
                                                            // $timeout(function ()
                                                            //{
                                                            canSendFlag = false;
                                                            scope.$apply(function ()
                                                            {
                                                                scope.valuetolisten = scope.value;
                                                                //canSendFlag = false;
                                                                timer = null;
                                                            });
                                                            // }, 0)
                                                        }
                                                }
                                        }
                                    draw();
                                };


                            var setValue = function ()
                                {
                                    var controlValueRange = scope.max - scope.min;
                                    var controlValuePrecent = parseFloat(bulletPosition) / parseFloat(scope.width - bulletDiameter);

                                    $timeout(function ()
                                    {
                                        scope.$apply(function ()
                                        {
                                            changeInternal = true;
                                            scope.value = parseInt(scope.min + (controlValuePrecent * controlValueRange));
                                            $("#kHorizontalSliderCoreCanvas_" + scope.hslidercoreid).attr('title', scope.value);
                                        });
                                    }, 0);
                                };

                            var setKnoobPosition = function (val)
                                {
                                    if (isNaN(val)) val = scope.min;
                                    if (val < scope.min) val = scope.min;
                                    if (val > scope.max) val = scope.max;
                                    var controlValueRange = scope.max - scope.min;
                                    var knoobPositionpercent = parseFloat(parseFloat(Math.abs(val - scope.min)) / parseFloat(controlValueRange));
                                    bulletPosition = parseInt(parseFloat(knoobPositionpercent) * parseFloat(scope.width - bulletDiameter));
                                    draw();
                                }

                        }
                };
            }]);


    })();