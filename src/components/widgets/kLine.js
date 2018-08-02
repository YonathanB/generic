/***********************************************
 * File Name: kLine.js
 * Created by: fassous
 * On: 22/10/2015 09:57
 * Last Modified:
 * Modified by:
 ***********************************************/

/***********************************************
 * File Name: kOnOff.js
 * Created by: Chezi Hoyzer
 * On: 21/09/2014  14:19
 * Last Modified: 21/09/2014
 * Modified by: Choyzer
 ***********************************************/
(function ()
{
    angular.module('components.widgets').directive("kLine", function ()
    {
        return {
            restrict: 'E',
            scope: {
                x1: '@',
                y1: '@',
                x2: '@',
                y2: '@',
                color : '@',
                visible: '=',
                controlClass:'@'

            },

            template: '<div class="kLine {{controlClass}}" ' +
                'style="left:{{x1}}px;top:{{y1}}px;width:{{length}}px;transform:rotate({{angle}}deg);background:{{color}};"></div>',

            compile: function (element, attrs)
            {
                if (!attrs.x1)
                    attrs.x1= 0;
                if (!attrs.y1)
                    attrs.y1= 0;
                if (!attrs.x2)
                    attrs.x2= 0;
                if (!attrs.y2)
                    attrs.y2= 0;
                if (!attrs.color)
                    attrs.color = "#000";
                if (!attrs.visible)
                    attrs.visible = "true";
                if (!attrs.controlClass)
                    attrs.controlClass= "";
                return this.link;
            },
            link: function (scope, element, attrs)
            {
                scope.length=0;
                scope.angle=0;

                var traceLine = function(){
                    scope.length = Math.sqrt((scope.x1-scope.x2)*(scope.x1-scope.x2) + (scope.y1-scope.y2)*(scope.y1-scope.y2));
                    scope.angle  = Math.atan2(scope.y2 - scope.y1, scope.x2 - scope.x1) * 180 / Math.PI;

                };

                traceLine();

                //scope.$watchCollection('[x1, y1 , x2 , y2]', function(newValues)
                //{
                //    console.log(newValues);
                //    var length = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
                //    var angle  = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
                //
                //});

                //scope.$watch('x1', function (val)
                //{
                //        var length = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
                //        var angle  = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
                //        var transform = 'rotate('+angle+'deg)';
                //
                //        var line = $('<div>')
                //            .appendTo('#page')
                //            .addClass('line')
                //            .css({
                //                'position': 'absolute',
                //                'transform': transform
                //            })
                //            .width(length)
                //            .offset({left: x1, top: y1});
                //
                //
                //});
                //
            }
        };
    });
})();