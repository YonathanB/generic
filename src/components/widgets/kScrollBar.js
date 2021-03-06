/**
 * Created by Choyzer on 10/12/2014.
 */

/***********************************************
 * File Name: kScrollBar.js
 * Created by: Chezi Hoyzer
 * On: 10/12/2014  16:52
 * Last Modified: 10/12/2014
 * Modified by: Choyzer
 ***********************************************/


//Important depend on perfectScrollbar Jquery library

(function ()
    {
        angular.module('components.widgets').directive('kScrollBar', ['$parse', '$window', '$timeout', function ($parse, $window, $timeout)
            {
                var psOptions = [
                    'wheelSpeed', 'wheelPropagation', 'minScrollbarLength', 'useBothWheelAxes',
                    'useKeyboard', 'suppressScrollX', 'suppressScrollY', 'scrollXMarginOffset',
                    'scrollYMarginOffset', 'includePadding'//, 'onScroll', 'scrollDown'
                ];

                return {
                    restrict: 'EA',
                    transclude: true,
                    template: '<div><div ng-transclude></div></div>',
                    replace: true,
                    link: function ($scope, $elem, $attr)
                        {
                            var jqWindow = angular.element($window);
                            var jqElem = angular.element($elem);
                            var options = {};

                            for (var i = 0, l = psOptions.length; i < l; i++)
                                {
                                    var opt = psOptions[i];
                                    if ($attr[opt] !== undefined)
                                        {
                                            options[opt] = $parse($attr[opt])();
                                        }
                                }

                            $scope.$evalAsync(function ()
                            {
                                $elem.perfectScrollbar(options);
                                var onScrollHandler = $parse($attr.onScroll);
                                $elem.scroll(function ()
                                {
                                    var scrollTop = $elem.scrollTop();
                                    var scrollHeight = $elem.prop('scrollHeight') - $elem.height();
                                    $scope.$apply(function ()
                                    {
                                        onScrollHandler($scope, {
                                            scrollTop: scrollTop,
                                            scrollHeight: scrollHeight
                                        })
                                    })
                                });
                            });

                            function update(event)
                                {
                                    $scope.$evalAsync(function ()
                                    {
                                        if ($attr.scrollDown == 'true' && event != 'mouseenter')
                                            {
                                                setTimeout(function ()
                                                {
                                                    $($elem).scrollTop($($elem).prop("scrollHeight"));
                                                }, 100);
                                            }
                                        $elem.perfectScrollbar('update');
                                    });

                                    // This is necessary if you aren't watching anything for refreshes
                                    if (!$scope.$$phase)
                                        {
                                            $scope.$apply();
                                        }

                                }

                            // This is necessary when you don't watch anything with the scrollbar
                            $elem.on('mouseenter', update('mouseenter'));

                            // Possible future improvement - check the type here and use the appropriate watch for non-arrays
                            if ($attr.refreshOnChange)
                                {
                                    $scope.$watchCollection($attr.refreshOnChange, function ()
                                    {
                                        update();
                                    });
                                }

                            // this is from a pull request - I am not totally sure what the original issue is but seems harmless
                            if ($attr.refreshOnResize)
                                {
                                    jqWindow.on('resize', update);
                                    //jqElem.children[0].mutate('height', update);
                                    $timeout(function ()
                                    {
                                        $(jqElem[0].children[0]).mutate('height', update);
                                    }, 2000);
                                    //jqElem.on('resize', update);
                                }

                            $elem.bind('$destroy', function ()
                            {
                                jqWindow.off('resize', update);
                                $elem.perfectScrollbar('destroy');
                            });

                            $timeout(function ()
                            {
                                update();
                            }, 500)
                        }
                };
            }]);

    })();