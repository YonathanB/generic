// /**
//  * Created by Choyzer on 12/01/2015.
//  */
// /***********************************************
//  * File Name: kZoomWindow.js
//  * Created by: Chezi Hoyzer
//  * On: 12/01/2015  10:41
//  * Last Modified: 12/01/2015
//  * Modified by: Choyzer
//  ***********************************************/
//
// //IMPORTANT - when getting data from device - it's important to update the "zoomFactor" and "overscan" and after that the "windowData" (because the zoomFactor and overscan effects on the windowData.posX windowData.posY)
// (function ()
//     {
//         angular.module('components.widgets').directive('kZoomWindow', ['$timeout', function ($timeout)
//             {
//                 return {
//                     restrict: 'E',
//
//                     scope: {
//                         resolution: '=?', //Expect to obj={}; obj.w obj.h
//                         backgroundImgSrc: '@?',
//                         HorizontalShiftStart: '=',
//                         HorizontalShiftEnd: '=',
//                         VerticalShiftStart: '=',
//                         VerticalShiftEnd: '=',
//                         absoluteCenter: '=',
//                         actualCenter: '=',
//
//                         controlWidth: '@',
//                         controlHeight: '@',
//                         //off = 1, 5% = 1.05, 10% = 1.1 and so on.
//                         overscan: '@',
//                         //parameters win:(0.. numberOfWindows),vlaue:{location,size} --- location (location.x location.y) size (size.w size.h)
//                         onWindowPositionChanged: '&',// must use like this: setClickFunctionName(insideVal) for deliver the value into the function
//
//                         windowColorClass: '@',
//
//                         //  The zoomfactor for which the image takes up the entire view
//                         zoomEquilibrium: '@',
//
//                         //from zoomEquilibrium (full screen) to N (N>zoomEquilibrium)
//                         zoomFactor: '@',
//
//                         //{titleTxt:"",inputTxt:"",posX:"",posY:""}
//                         windowData: '=',
//
//                         // print a message on top of the window
//                         warning: '='
//
//                     },
//                     template: '<canvas ng-attr-width="{{controlWidth}}"  ng-attr-height="{{controlHeight}}" ng-attr-style="width:{{controlWidth}}; height:{{controlHeight}}"></canvas>',
//                     compile: function (element, attrs)
//                         {
//                             if (!attrs.controlWidth)
//                                 { attrs.controlWidth = 547; }
//                             if (!attrs.controlHeight)
//                                 { attrs.controlHeight = 456; }
//                             if (!attrs.backgroundImgSrc)
//                                 { attrs.backgroundImgSrc = "colorbar.png"; }
//                             if (!attrs.overscan)
//                                 { attrs.overscan = 1; }
//                             if (!attrs.zoomEquilibrium)
//                                 { attrs.zoomEquilibrium = 10; }
//                             if (!attrs.zoomFactor)
//                                 { attrs.zoomFactor = 14; }
//                             if (!attrs.windowColorClass)
//                                 {
//                                     attrs.windowColorClass = "app-content-background-color";
//                                 }
//
//                             //the Link function
//                             return this.link;
//                         },
//                     link: function (scope, elem, attr)
//                         {
//
// //                            var MOUSE_PADDING_RESIZE = 20;
//                             var isInitFinish = false, invert = false;
//
//
//                             //contains all scalerWindowsControl objects
//                             var scalerWindow
// //                                , selectedWinID
//                                 ,
//                                 _Img_Fill_Patern, windowColor, canvas, canvasContext, controlWidth, controlHeight, images;
//
//                             var isMouseDown = false;
//                             var hasMoved = false;
//
//                             var difx, dify = 0;
//
//
//                             scope.$watch('resolution', function (val)
//                             {
//                                 if (isInitFinish)
//                                     {
//                                         refresh();
//                                     }
//                             });
//
//                             scope.$watch('windowData', function (newVal)
//                             {
//                                 if (!_.isUndefined(newVal))
//                                     {
//                                         if (!isInitFinish)
//                                             {
//                                                 initControl();
//                                                 isInitFinish = true;
//                                             }
//                                         else
//                                             {
//                                                 updateWindowFromData();
//                                                 refresh();
//                                             }
//                                     }
//                             }, true);
//
//                             scope.$watch('zoomFactor', function ()
//                             {
//                                 updateWindow();
//                             });
//
//                             scope.$watch('overscan', function ()
//                             {
//                                 updateWindow();
//                             });
//
//                         scope.$watch('warning', function () {
//                             refresh();
//                         });
//
//                             var updateWindow = function ()
//                                 {
//                                     var mul = 1 / ((parseFloat(scope.zoomFactor) * scope.overscan) / scope.zoomEquilibrium);
//
//                                     scalerWindow.invert = invert =  mul > 1;
//                                     if (invert) {
//                                         mul = 1 / mul;
//                                     }
//
//                                     var oldSize = {
//                                         w: scalerWindow.w,
//                                         h: scalerWindow.h
//                                     };
//
//                                     var relSize = getRelativePos(
//                                         { x: scope.resolution.w * mul, y: scope.resolution.h * mul },
//                                         scope.resolution.w,
//                                         scope.resolution.h,
//                                         controlWidth,
//                                         controlHeight);
//
//                                     var newSize = {
//                                         w: Math.round(relSize.x),
//                                         h: Math.round(relSize.y)
//                                     };
//
//                                     var oldPos = {
//                                         x: scalerWindow.x,
//                                         y: scalerWindow.y
//                                     };
//
//                                     var cx = oldPos.x - ((newSize.w - oldSize.w) / 2);
//                                     var cy = oldPos.y - ((newSize.h - oldSize.h) / 2);
//
//                                     if (cx < 0) cx = 0;
//                                     if (cy < 0) cy = 0;
//
//                                     if (cx > controlWidth - newSize.w)
//                                         {
//                                             cx = controlWidth - newSize.w;
//                                         }
//
//                                     if (cy > controlHeight - newSize.h)
//                                         {
//                                             cy = controlHeight - newSize.h;
//                                         }
//
//                                     var newPos = {
//                                         x: cx,
//                                         y: cy
//                                     };
//                                     scalerWindow.setX(newPos.x);
//                                     scalerWindow.setY(newPos.y);
//                                     scalerWindow.setW(newSize.w);
//                                     scalerWindow.setH(newSize.h);
//
//                                     //must to update the original array - because the change will affect also on device coordinate.
//                                     scope.windowData.posX = scalerWindow.getPos().x;
//                                     scope.windowData.posY = scalerWindow.getPos().y;
//
//                                     refresh();
//                                 };
//
//
//                             var mouseMove = function (e)
//                                 {
//                                     var mousePos = utils.getMousePos(canvas, e);
//
//                                     var topWinIndex = getWindowsOnTop(mousePos.x, mousePos.y);
//
//                                     if (isMouseDown)
//                                         {
//                                             hasMoved = true;
//                                             var nx = mousePos.x - difx;
//                                             var ny = mousePos.y - dify;
//                                             scalerWindow.setX(nx);
//                                             scalerWindow.setY(ny);
//                                             // Check borders
//                                             if (nx + scalerWindow.w > controlWidth)
//                                                 {
//                                                     scalerWindow.setX(controlWidth - scalerWindow.w);
//                                                 }
//                                             if (nx <= 0)
//                                                 {
//                                                     scalerWindow.setX(0);
//                                                 }
//                                             if (ny + scalerWindow.h > controlHeight)
//                                                 {
//                                                     scalerWindow.setY(controlHeight - scalerWindow.h);
//                                                 }
//                                             if (ny <= 0)
//                                                 {
//                                                     scalerWindow.setY(0)
//                                                 }
// //
//                                         }
//
//                                     refresh();
//
//                                     if (topWinIndex != -1)
//                                         {
//                                             $(elem[0].children[0]).addClass("mousePointer");
//                                         }
//                                     else
//                                         {
//                                             $(elem[0].children[0]).removeClass("mousePointer");
//                                         }
//                                 };
//
//
//                             var mouseDown = function (e)
//                                 {
//                                     if (utils.isRightClick(e) || invert) return;
//                                     var mousePos = utils.getMousePos(canvas, e);
//                                     var selected = getWindowsOnTop(mousePos.x, mousePos.y);
//                                     if (selected != -1)
//                                         {
//                                             difx = mousePos.x - scalerWindow.x;
//                                             dify = mousePos.y - scalerWindow.y;
//                                             isMouseDown = true;
//                                             scalerWindow.showResizeMoving = true;
//                                             refresh();
//                                         }
//                                 };
//
//                             var mouseUp = function (e)
//                                 {
//                                     var wasPresed = isMouseDown;
//                                     isMouseDown = false;
//                                     var mousePos = utils.getMousePos(canvas, e);
//                                     var selected = getWindowsOnTop(mousePos.x, mousePos.y);
//                                     if (selected != -1)
//                                         {
//                                             if (hasMoved)
//                                                 { // Send only if the windows was moved o resized.
//                                                     if (wasPresed)
//                                                         {
//                                                             //parameters win:(0.. numberOfWindows),vlaue:{location,size} --- location (x y) size (w h)
//                                                             if (!_.isUndefined(scope.onWindowPositionChanged))
//                                                                 {
//                                                                     scope.$apply(function ()
//                                                                     {
//                                                                         scope.onWindowPositionChanged({insideVal: scalerWindow.getPos()});
//                                                                     })
//                                                                 }
//                                                         }
//                                                 }
//                                         }
//                                     scalerWindow.showResizeMoving = false;
//                                     refresh();
//                                     hasMoved = false;
//                                 };
//
//                             var refresh = function ()
//                                 {
//                                     canvasContext.clearRect(0, 0, controlWidth, controlHeight);
//                                     if (!invert) {
//                                         canvasContext.globalAlpha = 1;
//                                         canvasContext.fillStyle = "#050505";
//                                         canvasContext.fillRect(100, 210, controlWidth, controlHeight);
//                                         canvasContext.drawImage(_Img_Fill_Patern, 100, 100, controlWidth, controlHeight);
//                                     }
//
//                                     scalerWindow.draw()
//                                 };
//
//                             var initControl = function ()
//                                 {
//
//                                     _Img_Fill_Patern = new Image();
//                                     _Img_Fill_Patern.src = scope.backgroundImgSrc;
//
//                                     windowColor = utils.getClassProperty("background-color", scope.windowColorClass);
//
//                                     canvas = angular.element(elem[0].children[0])[0];
//                                     canvasContext = canvas.getContext("2d");
//
//                                     controlWidth = scope.controlWidth || 547;
//                                     controlHeight = scope.controlHeight || 456;
//                                     scope.resolution = scope.resolution || {w: 1280, h: 1024};
//                                     controlWidth = parseInt(controlWidth);
//                                     controlHeight = parseInt(controlHeight);
//
//                                     images = {};
//
//
//                                     images.image = new Image();
//                                     images.image.src = "spritesheet.png";
//
//                                     var posMove = utils.getClassProperty('background-position', 'icon_arrow_move');
//                                     images.MoveTop = parseInt(posMove.split(' ')[0]) * -1;
//                                     images.MoveLeft = parseInt(posMove.split(' ')[1]) * -1;
//
//
//                                     $(elem[0].children[0]).on('touchstart mousedown', function (e)
//                                     {
//                                         mouseDown(e);
//                                         e.stopPropagation();
//                                     });
//                                     $(elem[0].children[0]).on('touchmove mousemove', function (e)
//                                     {
//                                         mouseMove(e);
//                                     });
//                                     $(elem[0].children[0]).on('touchend mouseup mouseout', function (e)
//                                     {
//                                         mouseUp(e);
//                                         e.stopPropagation();
//                                     });
//
//                                     scalerWindow = new scalerWindowsControl();
//                                     scalerWindow.setSize(scope.resolution);
//
//                                     updateWindowFromData();
//                                     $timeout(refresh, 100);
//                                 };
//
//
//                             var updateWindowFromData = function ()
//                                 {
//                                     //scalerWindow.setSize({w: scope.windowData.width, h: scope.windowData.height});
//                                     scalerWindow.setPos({x: scope.windowData.posX, y: scope.windowData.posY});
//                                 };
//
//                         var displayWarning = function () {
//
//                             canvas = angular.element(elem[0].children[0])[0];
//                             canvasContext = canvas.getContext("2d");
//
//                             canvasContext.save();
//                             canvasContext.translate(canvasContext.canvas.width / 2, canvasContext.canvas.height * 0.667);
//                             canvasContext.textAlign = "center";
//                             canvasContext.font = "30px Arial";
//                             canvasContext.fillText(scope.warning, 0, 0, canvasContext.canvas.width);
//                             canvasContext.restore();
//                         }
//
//                             //Window Object
//                             function scalerWindowsControl()
//                                 {
//
//                                     this.showResizeRight = false;
//                                     this.showResizeLeft = false;
//                                     this.showResizeDown = false;
//                                     this.showResizeTop = false;
//                                     this.showResizeMoving = false;
//
//
//                                     this.x = 0;
//                                     this.y = 0;
//                                     this.w = 0;
//                                     this.h = 0;
//
//                                     this.setX = function (x)
//                                         {
//                                             this.x = x;
//                                         };
//
//                                     this.setY = function (y)
//                                         {
//                                             this.y = y;
//                                         };
//
//                                     this.setH = function (h)
//                                         {
//                                             this.h = h;
//                                         };
//
//                                     this.setW = function (w)
//                                         {
//                                             this.w = w;
//                                         };
//
//                                     this.setVisible = function (v)
//                                         {
//                                             this.visible = v;
//                                         };
//
//
//                                     this.getPos = function ()
//                                         {
//                                             var pos = getRelativePos({ x: this.x, y: this.y }, controlWidth, controlHeight, scope.resolution.w, scope.resolution.h);
//                                             return {
//                                                 x: pos.x,
//                                                 y: pos.y
//                                             }
//                                         };
//
//                                     this.setPos = function (pos)
//                                         {
//                                             var realPos = getRelativePos({ x: pos.x, y: pos.y }, scope.resolution.w, scope.resolution.h, controlWidth, controlHeight);
//                                             if (realPos.x < 0) realPos.x = 0;
//                                             if (realPos.y < 0) realPos.y = 0;
//                                             this.setX(realPos.x);
//                                             this.setY(realPos.y);
//                                             this.checkBounds();
//                                         };
//
//                                     this.getSize = function ()
//                                         {
//                                             var r = getRelativePos({ x: this.w, y: this.h }, controlWidth, controlHeight, scope.resolution.w, scope.resolution.h);
//                                             return {
//                                                 w: r.x,
//                                                 h: r.y
//                                             }
//                                         };
//
//                                     this.setSize = function (size)
//                                         {
//                                             var realSize = getRelativePos({ x: size.w, y: size.h }, scope.resolution.w, scope.resolution.h, controlWidth, controlHeight);
//                                             this.setW(realSize.x);
//                                             this.setH(realSize.y);
//                                             this.checkBounds();
//                                         };
//
//
//                                     this.setWidth = function (w)
//                                         {
//
//                                             this.setW(w);
//                                         };
//
//                                     this.setHeight = function (h)
//                                         {
//                                             this.setH(h);
//                                         };
//
//
//                                     this.checkBounds = function ()
//                                         {
//                                             if (this.x + this.w > controlWidth)
//                                                 {
//                                                     this.setX(controlWidth - this.w);
//                                                 }
//
//                                             if (this.y + this.h > controlHeight)
//                                                 {
//                                                     this.setY(controlHeight - this.h)
//                                                 }
//                                         };
//
//                                     this.showWindowFramework = function(x, y, w, h, zoomIn) {
//                                         canvasContext.globalAlpha = 1;
//                                         canvasContext.lineWidth = 0.5;
//
//                                         canvasContext.strokeStyle = "white";
//                                         canvasContext.strokeRect(x + 4, y + 4, w - 8, h - 8);
//
//                                         canvasContext.fillStyle = zoomIn ? "white" : "green";
//                                         canvasContext.font = "12px Arial";
//
//                                         canvasContext.fillText("" + scope.windowData.titleTxt + " > " + scope.windowData.inputTxt, x + 6, y + 16);
//
//                                         canvasContext.font = "10px Arial";
//                                         var r = getRelativePos({
//                                             x: w,
//                                             y: h
//                                         }, controlWidth, controlHeight, scope.resolution.w, scope.resolution.h);
//                                         var p = getRelativePos({
//                                             x: x,
//                                             y: y
//                                         }, controlWidth, controlHeight, scope.resolution.w, scope.resolution.h);
//
//                                         canvasContext.fillText("P:" + p.x + " x " + p.y, x + 6, y + 26);
//                                         canvasContext.fillText("R:" + r.x + " x " + r.y, x + 6, y + 36);
//
//                                         if (scope.warning)
//                                             displayWarning();
//                                     }
//
//                                     this.draw = function ()
//                                         {
//                                             var x = this.x;
//                                             var y = this.y;
//                                             var w = this.w;
//                                             var h = this.h;
//
//
//                                             if (this.invert) {
//                                                 canvasContext.drawImage(_Img_Fill_Patern, x, y, w, h);
//                                                 this.showWindowFramework(0, 0, canvasContext.canvas.width, canvasContext.canvas.height, false);
//
//                                             } else {
//                                                 canvasContext.fillStyle = windowColor;
//                                                 canvasContext.globalAlpha = 0.5;
//                                                 canvasContext.fillRect(x, y, w, h);
//                                                 this.showWindowFramework(x, y, w, h, true);
//                                                 if (this.showResizeMoving)
//                                                     {
//                                                         canvasContext.drawImage(images.image, images.MoveTop, images.MoveLeft, 30, 30, x + (w / 2) - 15, y + (h / 2) - 15, 30, 30);
//                                                     }
//                                                 }
//                                         }
//                                 }
//
//
//                             //help function
//                             var getRelativePos = function (pos, winW, winH, devW, devH)
//                                 {
//                                     var nx = (parseFloat(devW) / parseFloat(winW)) * pos.x;
//                                     var ny = (parseFloat(devH) / parseFloat(winH)) * pos.y;
//                                     return {
//                                         x: Math.round(nx),
//                                         y: Math.round(ny)
//                                     };
//                                 }
//
//                             var getWindowsOnTop = function (posX, posY)
//                                 {
//                                     if ((posX >= scalerWindow.x) && (posX <= (scalerWindow.x + scalerWindow.w)))
//                                         {
//                                             if ((posY >= scalerWindow.y) && (posY <= (scalerWindow.y + scalerWindow.h)))
//                                                 {
//                                                     return 1;
//                                                 }
//                                         }
//
//                                     return -1;
//                                 }
//
//
//                         }
//                 };
//             }]);
//
//     })();
//

/***********************************************
 * File Name: kZoomWindow.js
 * Created by: Yonathan Benitah
 * On: 11/09/2016  15:44
 * Last Modified: 11/09/2016
 * Modified by: ybenitah
 ***********************************************/

(function () {
    angular.module('components.widgets').directive('kDraggableWindow', function () {
        return {
            link: function (scope, element) {
                // this gives us the native JS object
                var el = element[0];
                element.css({
                    position: 'fixed',
                    cursor: 'move'
                });
                el.draggable = true;

                el.addEventListener(
                    'dragstart',
                    function (e) {
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('Text', this.id);
                        this.classList.add('drag');
                        return false;
                    },
                    false
                );

                el.addEventListener(
                    'dragend',
                    function (e) {
                        this.classList.remove('drag');
                        return false;
                    },
                    false
                );
            }
        };
    });
})();

//IMPORTANT - when getting data from device - it's important to update the "zoomFactor" and "overscan" and after that the "windowData" (because the zoomFactor and overscan effects on the windowData.posX windowData.posY)
(function () {
    angular.module('components.widgets').directive('kZoomWindow', ['$compile', '$timeout', function ($compile, $timeout) {

        // var windowScale;

        var resolveTemplate = function (model, $elem) {
            var parentWidth, parentHeight;
            if (!$elem.attr('width'))
                parentWidth = parseFloat((model.window['input'].resolution.w + (model['shift'].w.end - model['shift'].w.start)) * 0.3);
            if (!$elem.attr('height'))
                parentHeight = parseFloat((model.window['input'].resolution.h + (model['shift'].h.end - model['shift'].h.start)) * 0.3);

            var template = '<div class="window-container"  style="width:' + parentWidth + 'px; height:' + parentHeight + 'px; position: relative">';


            for (var win in  model.window) {

                if (win == 'input' && angular.isUndefined(model.window[win].fill))
                    model.window[win].fill = 'url(colorbar.png) repeat';
                else
                    model.window[win].fill = 'none';


                template += '<div class="window ';
                template += model.window[win].draggable ? ' draggable "': '"';
                template += model.window[win].resizable ? ' k-resize ': '';
                template += ' style="width: ' + (model.window[win].resolution.w) * 0.3 + 'px' + ';';
                template += ' height: ' + (model.window[win].resolution.h) * 0.3 + 'px' + '; ';
                template += ' background: ' + model.window[win].fill + '; background-size: contain"></div>';
            }

            return template + '</div>'
        };

        return {
            restrict: 'E',
            scope: {
                ngModel: '='
            },
            link: function (scope, $elem, attr) {

                $elem.html(resolveTemplate(scope.ngModel, $elem)).show();

                $timeout(function(){
                    // for (var elem in $elem.find('.draggable')){
                        var toAppend = angular.element($elem.find('.draggable')[0]);
                    toAppend.attr('k-draggable', true);
                    toAppend.attr('top-limit', $elem.offset().top);
                    toAppend.attr('bottom-limit', toAppend.parent().height() + $elem.offset().top);
                    toAppend.attr('left-limit', $elem.offset().left);
                    toAppend.attr('right-limit', toAppend.parent().width() + $elem.offset().left);
                    $compile($elem.contents())(scope);
                    // }
                }, 0);


            }
        };
    }]);

})();


