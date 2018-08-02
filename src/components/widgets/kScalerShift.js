/***********************************************
 * File Name: kScalerShift
 * Created by: Yonathan Benitah
 * On: 22/09/2016  12:04
 * Last Modified: 22/09/2016
 * Modified by: ybenitah
 ***********************************************/

(function () {
    angular.module('components.widgets').directive('kScalerShift', ['$window', function ($window) {
        var uiWindow = function (inputWindowData, ratio) {
            this.scale = inputWindowData.scale;
            this.ratio = ratio;
            this.shift = {
                horizontal: Math.round(inputWindowData.shift.horizontal / this.ratio),
                vertical: Math.round(inputWindowData.shift.vertical / this.ratio)
            };
            this.resolution = {
                width: Math.round(inputWindowData.resolution.width / this.ratio),
                height: Math.round((inputWindowData.resolution.height / this.ratio))
            };
            this.centering = {
                horizontal: Math.round(inputWindowData.centering.horizontal / this.ratio),
                vertical: Math.round(inputWindowData.centering.vertical / this.ratio)
            };

            this.updateWindow = function(newWindowData, ratio){
                this.scale = newWindowData.scale;
                this.ratio = ratio;
                this.shift = {
                    horizontal: Math.round(newWindowData.shift.horizontal / this.ratio),
                    vertical: Math.round(newWindowData.shift.vertical / this.ratio)
                };
                this.resolution = {
                    width: Math.round(newWindowData.resolution.width / this.ratio),
                    height: Math.round((newWindowData.resolution.height / this.ratio))
                };
                this.centering = {
                    horizontal: Math.round(newWindowData.centering.horizontal / this.ratio),
                    vertical: Math.round(newWindowData.centering.vertical / this.ratio)
                };
            }

        };
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                horizontalShiftMax: '@',
                horizontalShiftMin: '@',
                verticalShiftMin: '@',
                verticalShiftMax: '@',

                isEnable: '=',
                onShiftChanged: '&',
                windowData: '=ngModel' // position{ horizontalShift, verticalShift}, resolution:{ width, height}, centering{ horizontal, vertical}
            },
            // pointer-events: none;
            template: '<div class="shift-window-container" ng-class="{disabled: !isEnable}" ng-style="container" style="position: relative;display: flex;.flex-justify-content(center);.flex-align-items(center);background-color: #252525;"> ' +
            '<div class="window draggable" k-draggable="true" on-drag="shiftChanged($obj)" container-limit="true" ng-style="windowStyle()" style="background: url(colorbar.png) no-repeat repeat; background-size: contain; position: absolute; box-sizing: border-box;"></div>' +
            '<div class="window centering" style=" position: absolute;  box-shadow: 0px 0px 7px #888; box-sizing: border-box; pointer-events: none;" ng-style="centeringStyle()"></div>' +
            '<ng-transclude></ng-transclude><div class="disabled-window" ng-show="!isEnable" ng-style="container" style="background-color: rgba(48, 48, 48, 0.62); position: absolute;left: 0px; top: 0px;"></div></div>',

            compile: function (element, attrs) { // set default values
                if (angular.isUndefined(attrs.horizontalShiftMin)) attrs.horizontalShiftMin = 0;
                if (angular.isUndefined(attrs.horizontalShiftMax)) attrs.horizontalShiftMax = 0;
                if (angular.isUndefined(attrs.verticalShiftMin)) attrs.verticalShiftMin = 0;
                if (angular.isUndefined(attrs.verticalShiftMax)) attrs.verticalShiftMax = 0;

                if (angular.isUndefined(attrs.isEnable)) attrs.isEnable = true;

                return this.link;
            },
            link: function (scope, $elem, attrs) {
                // TODO - 300 should be responsive
                var ratio = (scope.windowData.resolution.width + (scope.horizontalShiftMax - scope.horizontalShiftMin)) / 500;

                scope.container = {
                    width: '500px',
                    height: Math.round((scope.windowData.resolution.height + (scope.verticalShiftMax - scope.verticalShiftMin))/ratio) + 'px'
                };

                scope.model = new uiWindow(scope.windowData, ratio);



                scope.centeringStyle = function(){
                    var scale = (scope.model.scale > 100) ? (100 / scope.model.scale) : 1;
                    if(scale < 100/4000)
                        scale = 100/4000;
                    return {
                        width: scope.model.resolution.width + 'px',
                        height: scope.model.resolution.height + 'px',
                        outline: (1/scale) + 'px solid rgb(56, 56, 56)',
                        top: scope.model.centering.vertical + 'px',
                        left: scope.model.centering.horizontal + 'px',
                        transform: 'scale(' + scale + ')'
                    }
                };
                scope.windowStyle = function() {
                    var boxTop = scope.model.centering.vertical - scope.model.shift.vertical;
                    var boxLeft = scope.model.centering.horizontal - scope.model.shift.horizontal;
                    var scale = (scope.model.scale < 100 ) ? (scope.model.scale / 100) : 1;
                    if(scale < 8/100)
                        scale = 8/100;
                    var borderLeft = (scope.model.resolution.width - scope.model.resolution.width * scale)/2;
                    var  borderTop=  (scope.model.resolution.height - scope.model.resolution.height * scale)/2;
                    return {
                        width: scope.model.resolution.width + 'px',
                        height: scope.model.resolution.height + 'px',
                        top: scope.model.shift.vertical + 'px',
                        left: scope.model.shift.horizontal + 'px',
                        'box-shadow': 'inset ' + boxLeft * scale + 'px ' + boxTop * scale+ 'px  0px 0px rgba(0,0,0,0.7)',
                        'border-top': borderTop  +'px solid rgb(56, 56, 56)',
                        'border-bottom': borderTop +'px solid rgb(56, 56, 56)',
                        'border-left': borderLeft +'px solid rgb(56, 56, 56)',
                        'border-right': borderLeft +'px solid rgb(56, 56, 56)'
                    };
                };

                scope.shiftChanged = function (window) {
                    //update UImodel
                    scope.model.shift.vertical = window.position.top;
                    scope.model.shift.horizontal = window.position.left;

                    //update realWindow
                    var leftShift = window.position.left * scope.model.ratio;
                    var topShift = window.position.top * scope.model.ratio;
                    scope.windowData.shift = {
                        horizontal: Math.floor((leftShift > scope.horizontalShiftMax - scope.horizontalShiftMin)? scope.horizontalShiftMax - scope.horizontalShiftMin: leftShift),
                        vertical: Math.floor((topShift > scope.verticalShiftMax - scope.verticalShiftMin)? scope.verticalShiftMax - scope.verticalShiftMin:  topShift)
                    };
                    scope.onShiftChanged(scope.windowData);
                    scope.windowStyle();
                }

                scope.$watchCollection('[windowData.scale, windowData.shift.horizontal, windowData.shift.vertical, windowData.resolution.width, windowData.resolution.height]',
                    function(scale, hShift, vShift, wResolution, hResolution){
                    if(angular.isDefined(scope.windowData)) {
                        var ratio = (scope.windowData.resolution.width + (scope.horizontalShiftMax - scope.horizontalShiftMin)) / 500;
                        scope.container = {
                            width: '500px',
                            height: Math.round((scope.windowData.resolution.height + (scope.verticalShiftMax - scope.verticalShiftMin))/ratio) + 'px'
                        };
                        scope.model.updateWindow(scope.windowData, ratio);
                        scope.centeringStyle();
                        scope.windowStyle();
                    }
                });
            }
        };
    }])
})();