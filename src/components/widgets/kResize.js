/**
 * Created by CHoyzer on 05/10/2014.
 */
/***********************************************
 * File Name: kResize.js
 * Created by: Chezi Hoyzer
 * On: 05/10/2014  12:39
 * Last Modified: 05/10/2014
 * Modified by: CHoyzer
 ***********************************************/


import * as screenfull from 'screenfull';
(function ()
    {
        angular.module('components.widgets').directive("kResize", function ()
        {


            return {
                restrict: 'E',
                scope: {
                    state: '@',
                    visible: '@'
                },
                template: "<k-state-button  onaction='iconOnAction()' visible='{{visible}}' enabled='true' width='18px' states='iconStates' state='{{state}}'></k-state-button>",
                compile: function (element, attrs)
                    {

                        if (!attrs.visible)
                            { attrs.visible = true }
                        return this.link;
                    },
                link: function (scope, element, attrs)
                    {
                        //screenfull = window.navigator.standalone || (document.fullScreenElement && document.fullScreenElement !== null) || (document.mozFullScreen || document.webkitIsFullScreen) || (!window.screenTop && !window.screenY)

                        scope.state = 0;
                            if(screenfull)
                            {
                                var target = document.body;
                                $(window).on(screenfull.raw.fullscreenchange, function ()
                                {
                                    if (screenfull.isFullscreen)//state ==1
                                        {
                                            scope.state = 1;
                                        }
                                    else
                                        {
                                            scope.state = 0;
                                        }
                                });

                                var enterFullScreen = function ()
                                    {
                                        if (screenfull.enabled)
                                            {
                                                screenfull.request(target);

                                            }
                                    };

                                var exitFullScreen = function ()
                                    {
                                        if (screenfull.enabled)
                                            {
                                                screenfull.exit(target);
                                            }
                                    };

                                if (!scope.iconStates)
                                    {
                                        scope.iconStates = scope.iconStates = [];
                                        scope.iconStates.push({ iconClass: "icon-enlarge", title: "Click to full screen" })
                                        scope.iconStates.push({ iconClass: "icon-shrink", title: "Click to exit full screen" })
                                    }


                                if (!attrs.iconOnAction)
                                    {
                                        if (!screenfull.enabled)
                                            {
                                                scope.visible = false;
                                            }
                                        scope.iconOnAction = function ()
                                            {
                                                if (parseInt(scope.state) == 0)//enter full screen
                                                    {
                                                        scope.state = 1;
                                                        enterFullScreen();
                                                    }
                                                else//exit full screen
                                                    {
                                                        scope.state = 0;
                                                        exitFullScreen();
                                                    }
                                            }
                                    }
                            }
                        else
                            {
                                scope.visible = false;
                            }

                    }
            }
        });
    })();