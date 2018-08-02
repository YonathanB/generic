/**
 * Created by Choyzer on 25/12/2014.
 */
/***********************************************
 * File Name: kScalerWindow.js
 * Created by: Chezi Hoyzer
 * On: 25/12/2014  15:38
 * Last Modified: 25/12/2014
 * Modified by: Choyzer
 ***********************************************/


//TODO - need to check when changing resolution - if to make the changes for "windowsData" (new win calculation - base on the new resolution) or not to make any change and whit for device response (i.e new win-cust)
(function ()
    {
        angular.module('components.widgets').directive('kScalerWindow', ['$window', function ( $window)
            {
                var scale = {
                    x: 1,
                    y: 1
                };


                return {
                    restrict: 'E',

                    scope: {
                        resolution: '=?', //Expect to obj={}; obj.w obj.h
                        backgroundImgSrc: '@?',
//                        enableLayerChange: '=?',

                        controlWidth: '@',
                        controlHeight: '@',
                        //parameters array with new layer order
                        //onLayerChanged: '&',// must use like this: setClickFunctionName(insideVal) for deliver the value into the function

                        //parameters win:(0.. numberOfWindows),vlaue:{location,size} --- location (location.x location.y) size (size.w size.h)
                        onWindowValueChanged: '&',// must use like this: setClickFunctionName(insideVal) for deliver the value into the function
                        onSelection: '&',

                        activeWindowColorClass: '@',
                        noneActiveWindowColorClass: '@',

                        //  Flag to turn resizing and detailed display on/off. By default its on
                        activeWindow: '=',

                        selectedWindow: '=',

                        //this format: Array index it's the window order 0->lower  numberOfWindows->most upper
                        //[{titleTxt:"",inputTxt:"",width:"",height:"",posX:"",posY:"",isLock:"",visible="",layer: 0}
                        //,{titleTxt:"",inputTxt:"",width:"",height:"",posX:"",posY:"",isLock:"",visible="",layer: 0}...
                        // ]
                        windowsData: '='

                    },
                    template: '<canvas ng-attr-width="{{controlWidth}}"  ng-attr-height="{{controlHeight}}" ng-attr-style="width:{{controlWidth}}; height:{{controlHeight}}"></canvas>',
                    compile: function (element, attrs)
                        {
                            if (!attrs.controlWidth)
                                { attrs.controlWidth =  element.find('canvas').width(); }
                            if (!attrs.controlHeight)
                                { attrs.controlHeight =  element.find('canvas').height(); }
                            if (!attrs.backgroundImgSrc)
                                { attrs.backgroundImgSrc = "fillpattern.png"; }
                            if (_.isUndefined(attrs.activeWindow)) {
                                attrs.activeWindow = true;
                            }

//                            if (!attrs.enableLayerChange)
//                                { attrs.enableLayerChange = false; }


                            if (!attrs.activeWindowColorClass)
                                { attrs.activeWindowColorClass = "app-main-background-color"; }
                            if (!attrs.noneActiveWindowColorClass)
                                {
                                    attrs.noneActiveWindowColorClass = "app-content-background-color";
//                                    attrs.noneActiveWindowColorClass = "app-main-background-color-hover";
                                }


                            //the Link function
                            return this.link;
                        },
                    link: function (scope, elem, attrs)
                        {
                            scope.canvas = elem.find('canvas');
                            var MOUSE_PADDING_RESIZE,
                                isInitFinish,
                                windowsArray,
                                selectedWinID,
                                _Img_Fill_Patern,
                                activeColor,
                                noneActiveColor,
                                canvas,
                                canvasContext,
                                controlWidth,
                                controlHeight,
                                images,
                                isMouseDown,
                                hasMoved,
                                difx,
                                dify;

                            var init = function(){
                                MOUSE_PADDING_RESIZE = 20;
                                isInitFinish = false;
                                isMouseDown = false;
                                hasMoved = false;
                                difx = 0;
                                dify = 0;

                                scope.controlWidth =   scope.canvas.width();
                                scope.controlHeight =   scope.canvas.height();


                            };

                            init();



                            // scope.originalSize = {
                            //     width: scope.canvas.width(),
                            //     height: scope.canvas.height()
                            // };

                            // angular.element($window).bind('resize', function() {
                            //    scale.x = scope.canvas.width()/scope.controlWidth;
                            //    scale.y = scope.canvas.height()/scope.controlHeight;
                            // });



                            scope.$watch('resolution', function (val)
                            {
                                if (val && isInitFinish)
                                {
                                    updateWindowsFromData();
                                    refresh();
                                }
                            });
                            scope.$watch('selectedWindow', function (val)
                            {
                                if (isInitFinish && angular.isDefined(val))
                                {
                                    setActive(val);
                                }
                            });

                            scope.$watch('windowsData', function (newVal, oldVal)
                            {
                                if (!_.isUndefined(newVal))
                                    {
                                        if (!isInitFinish)
                                            {
                                                initControl();
                                                isInitFinish = true;
                                            }
                                        else
                                            {
                                                updateWindowsFromData();
                                                refresh();
                                            }
                                    }
                            }, true);


                            var mouseMove = function (e)
                                {
                                    scale.x = scope.canvas.width()/scope.controlWidth;
                                    scale.y = scope.canvas.height()/scope.controlHeight;

                                    var mousePos = utils.getMousePos(canvas, e);
                                    mousePos.x = mousePos.x / scale.x;
                                    mousePos.y = mousePos.y / scale.y;
                                    var win = windowsArray[selectedWinID];
                                    var topWinIndex = getWindowsOnTop(mousePos.x, mousePos.y);
                                    if (win)
                                        {
                                            // var relX = (elem.find('canvas').width()/controlWidth);
                                            // var relY = (elem.find('canvas').height()/controlHeight);

                                            if (isMouseDown)
                                                {
                                                    hasMoved = true;
                                                    // MOVE
                                                    if (!win.showResizeRight && !win.showResizeDown && !win.showResizeTop && !win.showResizeLeft)
                                                        {
                                                            var nx = mousePos.x - difx;
                                                            var ny = mousePos.y - dify;
                                                            win.setX(nx);
                                                            win.setY(ny);
                                                            // Check borders
                                                            if (nx + win.w > controlWidth)
                                                                {
                                                                    win.setX(controlWidth - win.w);
                                                                }
                                                            if (nx <= 0)
                                                                {
                                                                    win.setX(0);
                                                                }
                                                            if (ny + win.h > controlHeight)
                                                                {
                                                                    win.setY(controlHeight - win.h);
                                                                }
                                                            if (ny <= 0)
                                                                {
                                                                    win.setY(0)
                                                                }
                                                        }

                                                    // RESIZERIGHT
                                                    if (win.showResizeRight)
                                                        {
                                                            var nw = mousePos.x - win.x + 10;
                                                            // Check Borders
                                                            if (nw + win.x >= controlWidth)
                                                                {
                                                                    win.setWidth(controlWidth - win.x);
                                                                }
                                                            else
                                                                {
                                                                    if (nw > 25)
                                                                        {
                                                                            win.setWidth(nw);
                                                                        }
                                                                }
                                                        }
                                                    // RESIZELEFT
                                                    if (win.showResizeLeft)
                                                        {
                                                            var difX = parseInt(win.x - mousePos.x);
                                                            // Check Borders
                                                            if (difX + win.w > 25)
                                                                {
                                                                    win.setX(win.x - difX);
                                                                    win.setWidth(win.w + difX);
                                                                }
                                                        }

                                                    // RESIZEDOWN
                                                    if (win.showResizeDown)
                                                        {
                                                            var nh = mousePos.y - win.y + 10;
                                                            // Check Borders
                                                            if (nh + win.y >= controlHeight)
                                                                {
                                                                    win.setHeight(controlHeight - win.y);
                                                                }
                                                            else
                                                                {
                                                                    if (nh > 25)
                                                                        {
                                                                            win.setHeight(nh);
                                                                        }
                                                                }
                                                        }
                                                    // RESIZETOP
                                                    if (win.showResizeTop)
                                                        {
                                                            var difY = parseInt(win.y - mousePos.y);

                                                            if (difY + win.h > 25)
                                                                {
                                                                    win.setY(win.y - difY);
                                                                    win.setHeight(win.h + difY);
                                                                }
                                                        }


                                                }
                                            else
                                                {
                                                    win.showResizeRight = false;
                                                    win.showResizeDown = false;
                                                    win.showResizeTop = false;
                                                    win.showResizeLeft = false;

                                                    if ((mousePos.x > win.x + win.w - MOUSE_PADDING_RESIZE && mousePos.x < win.x + win.w)
                                                        && (mousePos.y > win.y && mousePos.y < win.y + win.h) && selectedWinID == topWinIndex)
                                                        {
                                                            win.showResizeRight = true;

                                                        }

                                                    if ((mousePos.x > win.x && mousePos.x < win.x + MOUSE_PADDING_RESIZE)
                                                        && (mousePos.y > win.y && mousePos.y < win.y + win.h) && selectedWinID == topWinIndex && !win.isLock)
                                                        {
                                                            win.showResizeLeft = true;
                                                        }

                                                    if (mousePos.y > win.y + win.h - MOUSE_PADDING_RESIZE && mousePos.y < win.y + win.h &&
                                                        (mousePos.x > win.x && mousePos.x < win.x + win.w) && selectedWinID == topWinIndex)
                                                        {
                                                            win.showResizeDown = true;
                                                        }

                                                    if (mousePos.y > win.y && mousePos.y < win.y + MOUSE_PADDING_RESIZE &&
                                                        (mousePos.x > win.x && mousePos.x < win.x + win.w) && selectedWinID == topWinIndex && !win.isLock)
                                                        {
                                                            win.showResizeTop = true;
                                                        }
                                                }
                                            refresh()
                                        }

                                    if (topWinIndex == selectedWinID && topWinIndex != -1)
                                        {
                                            $(elem[0].children[0]).addClass("mousePointer");
                                        }
                                    else
                                        {
                                            $(elem[0].children[0]).removeClass("mousePointer");
                                        }
                                };

                            var mouseDblclick = function (e)
                                {
                                    if (utils.isRightClick(e)) return;
                                    var mousePos = utils.getMousePos(canvas, e);
                                    mousePos.x = mousePos.x / scale.x;
                                    mousePos.y = mousePos.y / scale.y;
                                    var topWinIndex = getWindowsOnTop(mousePos.x, mousePos.y);
                                    if (topWinIndex != -1)
                                        {
                                            windowsArray[topWinIndex].setX(0);
                                            windowsArray[topWinIndex].setY(0);
                                            windowsArray[topWinIndex].setW(controlWidth);
                                            windowsArray[topWinIndex].setH(controlHeight);
                                            if (!_.isUndefined(scope.onWindowValueChanged))
                                                {
                                                    scope.$apply(function ()
                                                    {
                                                        scope.onWindowValueChanged({insideVal: {win: selectedWinID, value: {location: windowsArray[topWinIndex].getPos(), size: windowsArray[topWinIndex].getSize()}}});
                                                    })
                                                }

                                            refresh();
                                        }
                                };

                            var mouseDown = function (e)
                                {
                                    if (utils.isRightClick(e) || !scope.activeWindow) return;
                                    var mousePos = utils.getMousePos(canvas, e);
                                    mousePos.x = mousePos.x / scale.x;
                                    mousePos.y = mousePos.y / scale.y;
                                    var selected = getWindowsOnTop(mousePos.x, mousePos.y);
                                    if (selected != -1)
                                        {
                                            scope.selectedWindow = selectedWinID = selected;

                                            if (!_.isUndefined(scope.onSelection))
                                                {
                                                    scope.$apply(function ()
                                                    {
                                                        scope.onSelection({insideVal: selectedWinID});
                                                    });
                                                }
                                            var win = windowsArray[selectedWinID];
                                            win.getAspectRatio();

                                            difx = mousePos.x - win.x;
                                            dify = mousePos.y - win.y;

                                            isMouseDown = true;

                                            setActive(selectedWinID);

                                            if (!win.showResizeRight && !win.showResizeDown && !win.showResizeLeft && !win.showResizeTop)
                                                {
                                                    win.showResizeMoving = true;
                                                }

                                            refresh();
                                        }
                                };

                            var mouseUp = function (e)
                                {
                                    var wasPresed = isMouseDown;
                                    isMouseDown = false;

                                    if (selectedWinID != -1)
                                        {
                                            var selWin = windowsArray[selectedWinID];

                                            if (hasMoved)
                                                { // Send only if the windows was moved o resized.
                                                    if (wasPresed)
                                                        {
                                                            //parameters win:(0.. numberOfWindows),vlaue:{location,size} --- location (x y) size (w h)
                                                            if (!_.isUndefined(scope.onWindowValueChanged))
                                                                {
                                                                    scope.$apply(function ()
                                                                    {
                                                                        scope.onWindowValueChanged({insideVal: {win: selectedWinID, value: {location: selWin.getPos(), size: selWin.getSize()}}});

                                                                    })
                                                                }
                                                        }
                                                }


                                            selWin.showResizeRight = false;
                                            selWin.showResizeDown = false;
                                            selWin.showResizeLeft = false;
                                            selWin.showResizeTop = false;
                                            selWin.showResizeMoving = false;
                                            refresh();

                                        }
                                    hasMoved = false;
                                };

                            var refresh = function ()
                                {
                                    canvasContext.clearRect(0, 0, controlWidth, controlHeight);
                                    canvasContext.globalAlpha = 1;
                                    canvasContext.fillStyle = "#050505";
                                    canvasContext.fillRect(0, 0, controlWidth, controlHeight);
//
                                    canvasContext.fillStyle = canvasContext.createPattern(_Img_Fill_Patern, 'repeat');

                                    canvasContext.fillRect(0, 0, controlWidth, controlHeight);

                                    for (var i = 0; i < scope.windowsData.length; i++)
                                        for (var j = 0; j < scope.windowsData.length; j++)
                                            {
                                                if (i == windowsArray[j].layer)
                                                    {
                                                        windowsArray[j].draw();
                                                    }
                                            }


                                };

                            var setActive = function (id)
                                {
                                    for (var i = 0; i < windowsArray.length; i++)
                                        windowsArray[i].setActive(false);

                                    windowsArray[id].setActive(true);
                                    updateWindowsFromData();
                                    refresh();
                                }


                            var initControl = function ()
                                {
                                    windowsArray = [];
                                    _Img_Fill_Patern = new Image();
                                    _Img_Fill_Patern.src = scope.backgroundImgSrc;

                                    activeColor = utils.getClassProperty("background-color", scope.activeWindowColorClass);
                                    noneActiveColor = utils.getClassProperty("background-color", scope.noneActiveWindowColorClass);


                                    canvas = angular.element(elem[0].children[0])[0];
                                    canvasContext = canvas.getContext("2d");

                                    controlWidth = scope.controlWidth || 547;
                                    controlHeight = scope.controlHeight || 456;
                                    scope.resolution = scope.resolution || {w: 1280, h: 1024};
                                    controlWidth = parseInt(controlWidth);
                                    controlHeight = parseInt(controlHeight);

                                    images = {};


                                    images.image = new Image();
                                    images.image.src = "spritesheet.png";

                                    var posMove = utils.getClassProperty('background-position', 'icon_arrow_move');
                                    images.MoveTop = parseInt(posMove.split(' ')[0]) * -1;
                                    images.MoveLeft = parseInt(posMove.split(' ')[1]) * -1;

                                    var posRight = utils.getClassProperty('background-position', 'icon_arrow_r');
                                    images.RightTop = parseInt(posRight.split(' ')[0]) * -1;
                                    images.RightLeft = parseInt(posRight.split(' ')[1]) * -1;

                                    var posDown = utils.getClassProperty('background-position', 'icon_arrow_d');
                                    images.DownTop = parseInt(posDown.split(' ')[0]) * -1;
                                    images.DownLeft = parseInt(posDown.split(' ')[1]) * -1;

                                    var posAR = utils.getClassProperty('background-position', 'icon_aspectRatioStatus');
                                    images.LockTop = parseInt(posAR.split(' ')[0]) * -1;
                                    images.LockLeft = parseInt(posAR.split(' ')[1]) * -1;


                                    $(elem[0].children[0]).on('touchstart mousedown', function (e)
                                    {
                                        mouseDown(e);
                                        e.stopPropagation();
                                    });
                                    $(elem[0].children[0]).on('touchmove mousemove', function (e)
                                    {
                                        mouseMove(e);
                                    });
                                    $(elem[0].children[0]).on('touchend mouseup mouseout', function (e)
                                    {
                                        mouseUp(e);
                                        e.stopPropagation();
                                    });
                                    $(elem[0].children[0]).on('dblclick', function (e)
                                    {
                                        mouseDblclick(e);
                                    });


                                    for (var i = 0; i < scope.windowsData.length; i++)
                                        {
                                            windowsArray[i] = new scalerWindowsControl(i);
                                        }
                                    //set active the mose upper layer
                                    var upperLayer = -1;
                                    var selectWindow = -1;
                                    for (var i = 0; i < scope.windowsData.length; i++)
                                        {
                                            if (windowsArray[i].layer > upperLayer)
                                                {
                                                    upperLayer = windowsArray[i].layer;
                                                    selectWindow = i;
                                                }
                                        }
                                    setActive(selectWindow);
                                    scope.selectedWindow = selectedWinID = selectWindow;
                                    updateWindowsFromData();
                                    refresh();
                                };


                            var updateWindowsFromData = function ()
                                {
                                    for (var i = 0; i < scope.windowsData.length; i++)
                                        {
                                            windowsArray[i].setSize({w: scope.windowsData[i].width, h: scope.windowsData[i].height});
                                            windowsArray[i].setPos({x: scope.windowsData[i].posX, y: scope.windowsData[i].posY});
                                            windowsArray[i].setVisible(scope.windowsData[i].visible);
                                            windowsArray[i].setLayer(scope.windowsData[i].layer);
                                            windowsArray[i].setLock(scope.windowsData[i].isLock);

                                        }
                                }


                            //Window Object
                            function scalerWindowsControl(index)
                                {
                                    this.aspectRatio = 1;
                                    this.active = false;
                                    this.visible = scope.windowsData[index].visible;
                                    this.layer = scope.windowsData[index].layer;
                                    this.id = index;
                                    this.isLock = false;

                                    this.showResizeRight = false;
                                    this.showResizeLeft = false;
                                    this.showResizeDown = false;
                                    this.showResizeTop = false;
                                    this.showResizeMoving = false;


                                    this.x = 0;
                                    this.y = 0;
                                    this.w = 0;
                                    this.h = 0;

                                    this.setX = function (x)
                                        {
                                            this.x = x;
                                        };

                                    this.setY = function (y)
                                        {
                                            this.y = y;
                                        };

                                    this.setH = function (h)
                                        {
                                            this.h = h;
                                        };

                                    this.setW = function (w)
                                        {
                                            this.w = w;
                                        };

                                    this.setVisible = function (v)
                                        {
                                            this.visible = v;
                                        };

                                    this.setLayer = function (l)
                                        {
                                            this.layer = l;
                                        };


                                    this.setLock = function (l)
                                        {
                                            this.isLock = l;
                                        };

                                    this.setActive = function (a)
                                        {
                                            this.active = a;
                                        }


                                    this.getPos = function ()
                                        {
                                            var pos = getRelativePos({ x: this.x, y: this.y }, controlWidth, controlHeight, scope.resolution.w, scope.resolution.h);
                                            return {
                                                x: pos.x,
                                                y: pos.y
                                            }
                                        };

                                    this.setPos = function (pos)
                                        {
                                            var realPos = getRelativePos({ x: pos.x, y: pos.y }, scope.resolution.w, scope.resolution.h, controlWidth, controlHeight);
                                            if (realPos.x < 0) realPos.x = 0;
                                            if (realPos.y < 0) realPos.y = 0;
                                            this.setX(realPos.x);
                                            this.setY(realPos.y);
                                            this.checkBounds();
                                        };

                                    this.getSize = function ()
                                        {
                                            var r = getRelativePos({ x: this.w, y: this.h }, controlWidth, controlHeight, scope.resolution.w, scope.resolution.h);
                                            return {
                                                w: r.x,
                                                h: r.y
                                            }
                                        };

                                    this.setSize = function (size)
                                        {
                                            var realSize = getRelativePos({ x: size.w, y: size.h }, scope.resolution.w, scope.resolution.h, controlWidth, controlHeight);
                                            this.setW(realSize.x);
                                            this.setH(realSize.y);
                                            this.checkBounds();
                                        };


                                    this.getAspectRatio = function ()
                                        {
                                            this.aspectRatio = parseFloat(parseFloat(this.h) / parseFloat(this.w));
                                        };


                                    this.setWidth = function (w)
                                        {

                                            if (this.isLock)
                                                {
                                                    var nh = parseInt(parseFloat(w) * this.aspectRatio);
                                                    if (this.y + nh <= controlHeight)
                                                        {
                                                            this.setW(w);
                                                            this.setH(nh);
                                                        }
                                                }
                                            else
                                                {
                                                    this.setW(w);
                                                }
                                        };

                                    this.setHeight = function (h)
                                        {
                                            if (this.isLock)
                                                {
                                                    var nw = parseInt(parseFloat(h) / this.aspectRatio);
                                                    if (this.x + nw <= controlWidth)
                                                        {
                                                            this.setW(nw);
                                                            this.setH(h);
                                                        }
                                                }
                                            else
                                                {
                                                    this.setH(h);
                                                }
                                        };


                                    this.checkBounds = function ()
                                        {
                                            if (this.x + this.w > controlWidth)
                                                {
                                                    this.setX(controlWidth - this.w);
                                                }

                                            if (this.y + this.h > controlHeight)
                                                {
                                                    this.setY(controlHeight - this.h)
                                                }
                                        };

                                    this.draw = function ()
                                        {
                                            if (!this.visible) return;
                                            var x = this.x;
                                            var y = this.y;
                                            var w = this.w;
                                            var h = this.h;

                                            if (this.active)
                                                {
                                                    canvasContext.fillStyle = activeColor;
                                                }
                                            else
                                                {
                                                    canvasContext.fillStyle = noneActiveColor;
                                                }

                                            canvasContext.globalAlpha = 0.5;
                                            if (this.active)
                                                {
                                                    canvasContext.globalAlpha = 0.7;
                                                }
                                            canvasContext.fillRect(x, y, w, h);

                                            if (this.layer == (scope.windowsData.length - 1))//top window
                                                {
                                                    canvasContext.lineWidth = 1.5;
                                                }
                                            else
                                                {
                                                    canvasContext.lineWidth = 0.5;
                                                }

                                            canvasContext.strokeStyle = "white";
                                            canvasContext.strokeRect(x , y, w, h );

                                            canvasContext.fillStyle = "white";
                                            canvasContext.font = "12px Arial";

                                            if (scope.activeWindow) {
                                                canvasContext.fillText("" + scope.windowsData[index].titleTxt + " > " + scope.windowsData[index].inputTxt, x + 6, y + 16);

                                                if (this.active) {
                                                    canvasContext.font = "10px Arial";
                                                    var r = getRelativePos({
                                                        x: w,
                                                        y: h
                                                    }, controlWidth, controlHeight, scope.resolution.w, scope.resolution.h);
                                                    var p = getRelativePos({
                                                        x: x,
                                                        y: y
                                                    }, controlWidth, controlHeight, scope.resolution.w, scope.resolution.h);

                                                    canvasContext.fillText("P:" + p.x + " x " + p.y, x + 6, y + 26);
                                                    canvasContext.fillText("R:" + r.x + " x " + r.y, x + 6, y + 36);
                                                }
                                            }

                                            if (scope.windowsData.length > 2)
                                                {
                                                    canvasContext.fillStyle = "white";
                                                    canvasContext.font = "10px Arial";
                                                    canvasContext.fillText("Layer " + this.layer, x + 8, y + h - 10);
                                                }


                                            if (scope.activeWindow) {
                                                if (this.showResizeRight) {

                                                    canvasContext.drawImage(images.image, images.RightTop, images.RightLeft, 21, 10, x + w - 11, y + (h / 2) - 5, 21, 10);
                                                }

                                                if (this.showResizeLeft) {

                                                    canvasContext.drawImage(images.image, images.RightTop, images.RightLeft, 21, 10, x - 11 , y + (h / 2) - 5, 21, 10);
                                                }

                                                if (this.showResizeDown) {
                                                    canvasContext.drawImage(images.image, images.DownTop, images.DownLeft, 10, 21, x + (w / 2) - 5, y + h - 11, 10, 21);
                                                }

                                                if (this.showResizeTop) {
                                                    canvasContext.drawImage(images.image, images.DownTop, images.DownLeft, 10, 21, x + (w / 2) - 5, y - 11, 10, 21);
                                                }

                                                if (this.showResizeMoving) {
                                                    canvasContext.drawImage(images.image, images.MoveTop, images.MoveLeft, 30, 30, x + (w / 2) - 15, y + (h / 2) - 15, 30, 30);
                                                }
                                            }
                                            if (this.isLock)
                                                {
                                                    canvasContext.drawImage(images.image, images.LockTop, images.LockLeft, 16, 16, x + w - 28, y + h - 28, 16, 16);
                                                }

                                        }
                                }


                            //help function
                            var getRelativePos = function (pos, winW, winH, devW, devH)
                                {
                                    var nx = (parseFloat(devW) / parseFloat(winW)) * pos.x;
                                    var ny = (parseFloat(devH) / parseFloat(winH)) * pos.y;
                                    return {
                                        x: Math.round(nx),
                                        y: Math.round(ny)
                                    };
                                }

                            var getWindowsOnTop = function (posX, posY)
                                {
                                    var winArrayByLayer = [];

                                    for (var i = 0; i < windowsArray.length; i++)
                                        {
                                            for (var j = 0; j < windowsArray.length; j++)
                                                {
                                                    if (i == windowsArray[j].layer && windowsArray[j].visible )
                                                        {
                                                            winArrayByLayer.push(windowsArray[j]);
                                                            continue;
                                                        }
                                                }
                                        }

                                    var idOnTop = -1;
                                    var layerTop = -1;

                                    for (var i = 0; i < winArrayByLayer.length; i++)
                                        {
                                            var win = winArrayByLayer[i];


                                            if ((posX >= win.x) && (posX <= (win.x + win.w)))
                                                {
                                                    if ((posY >= win.y) && (posY <= (win.y + win.h)))
                                                        {
                                                            if (win.layer > layerTop)
                                                                {
                                                                    layerTop = win.layer;
                                                                    idOnTop = win.id;
                                                                }
                                                        }
                                                }
                                        }

                                    return idOnTop;
                                }


                        }
                };
            }]);

    })();
