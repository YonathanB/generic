/***********************************************
 * File Name: kSplashScreen.js
 * Created by: Fabrice
 * On: 03/03/2015  18:00
 * Last Modified: Fabrice
 * Modified by: 04/03/2015
 ***********************************************/

(function () {


    angular.module('components.widgets').directive("kSplashScreen", ['$timeout', function ($timeout) {
        return {
            restrict: 'E',
            scope: {
                closeIf: '=',
                timeout: '@'
            },
            template: '<div id="logo-page">\
                    <div id="logo">\
                        <div id="K1"></div>\
                    </div>\
                </div>',
            compile: function (element, attrs) {
                if (!angular.isDefined(attrs.closeIf)) {
                    attrs.closeIf = "true";
                }
                if (!angular.isDefined(attrs.timeout)) {
                    attrs.timeout = "2000";
                }
                return this.link;
            },
            link: function (scope, el, attrs) {

                var t = Date.now();
                var kLogoPage = document.getElementById('logo-page');
                var kLogo = document.getElementById('logo');
                var k1 = document.getElementById('K1');
                var GROW = 20;

                var hideSplashScreen = function () {
                    kLogoPage.style.opacity = "0";

                    $timeout(function () {
                        kLogoPage.style.display = "none";
                        //$timeout(function () {
                        //    console.log('step 4 - ' + (Date.now()-t));
                        //kLogoPage.style.display = "none";
                        //},1000)
                    }, 2000)


                };
                $timeout(function () {
                    k1.style.opacity = "1";
                    kLogo.classList.add('step1');

                    //style = kLogo.currentStyle || window.getComputedStyle(kLogo);
                    //
                    //
                    //kLogo.style.width = (kLogo.clientWidth + GROW) + 'px';
                    //kLogo.style.height = (kLogo.clientHeight + GROW) + 'px';
                    //kLogo.style.marginLeft = parseInt(style.marginLeft, 10) - (GROW/2) + 'px';
                    //kLogo.style.marginTop= parseInt(style.marginTop, 10) - (GROW/2) + 'px';


                    $timeout(function () {
                        //kLogo.classList.add('step2');
                        if (scope.closeIf == "true" || scope.closeIf == true) {
                            hideSplashScreen();
                        }
                        else {
                            scope.$watch('closeIf', function (nv, ov) {
                                if (angular.isDefined(nv) && nv && angular.isDefined(ov) && !ov) {
                                    hideSplashScreen();
                                }
                            });
                        }
                    }, scope.timeout);


                }, 0);


                //setTimeout(function ()
                //{
//                            //Step 1 - 100ms
//                            console.log('step 1 - ' + (Date.now()-t));
//                            var k1 = document.getElementById('K1');
//                            k1.style.opacity="1";
//
////                            kLogo.style.opacity = "1";
////                            k1.style.border="1px solid red";
////
////                            //Step 2 - 1000ms
//                            setTimeout(function ()
//                            {
//
//                                console.log('step 2 - ' + (Date.now()-t));
//////                                kLogo.style.opacity = "0";
////
////                            // Step 3 - 1000ms
//                                setTimeout(function ()
//                                {
//                                console.log('step 3 - ' + (Date.now()-t));
//                                    var kLogo = document.getElementById('logo');
//                                    kLogo.style.opacity= "0";
//
////                                    setTimeout(function ()
////                                    {
////                                        console.log('step 3');
//                                        var kLogoPage = document.getElementById('logo-page');
//                                    kLogoPage.style.display = "none";
////                                    }, 2000)
//                                }, 1000);
////                            //
//                            }, 1000);
//
//                        }, 100);

            }
        };
    }]);
})();
