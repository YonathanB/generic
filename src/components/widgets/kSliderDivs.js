/***********************************************
 * File Name: kSliderDiv.js
 * Created by: fassous
 * On: 08/10/2015 10:46
 * Last Modified:
 * Modified by:
 ***********************************************/

(function ()
    {

        angular.module('components.widgets').directive("kSliderDivs", ['$timeout', function ($timeout)
            {
                return {
                    restrict: 'E',
                    transclude: true,

                    scope: {
                        contentClass: '@',
                        divSelected: '=',
                        isAnimated: '=',
                        homeId: '@',
                        effect: '@',
                        showMenu: '=',
                        showArrows: '=',
                        homeIconClass: '@'
                    },

                    template: '' +
                    '<div class="kSliderDivs {{effect}}">' +
                    '<div  class="kSliderDivs-home {{homeIconClass}}" ng-click="select(homeId)"></div>' +
                    '<div class="kSliderDivs-main" ng-class="{isAnimated : isAnimated}">' +
                    '<div class="kSliderDivs-main-content" ng-class="{isAnimated : isAnimated}" ng-transclude></div>' +
                    '<div ng-if="showArrows" class="kSliderDivs-left" ng-click="select(divSelected - 1)"><div class="kSliderDivs-arrow">-</div></div>' +
                    '<div ng-if="showArrows" class="kSliderDivs-right" ng-click="select(divSelected + 1)"><div class="kSliderDivs-arrow">+</div></div>' +
                    '</div>' +
                    '<div ng-if="showMenu" class="kSliderDivs-menu" >' +
                    '<div class="kSliderDivs-link" ng-class="{selected:divSelected==$index}" ng-click="select($index)" ng-repeat="div in divs track by $index"></div>' +
                    '</div>' +
                    '</div>',

                    compile: function (element, attrs)
                        {
                            if (!attrs.contentClass)
                                {
                                    attrs.contentClass = "";
                                }
                            if (!attrs.divSelected)
                                {
                                    attrs.divSelected = 0;
                                }
                            if (!attrs.isAnimated)
                                {
                                    attrs.isAnimated = "true";
                                }
                            if (!attrs.homeId)
                                {
                                    attrs.homeId = 0;
                                }
                            if (!attrs.effect)
                                {
                                    attrs.effect = 'fade';
                                }
                            if (!attrs.showMenu)
                                {
                                    attrs.showMenu = 'true';
                                }
                            if (!attrs.showArrows)
                                {
                                    attrs.showArrows = 'true';
                                }
                            return this.link;

                        },
                    controller: function ($scope)
                        {
                            $scope.divs = [];
                            this.addDiv = function (divScope)
                                {
                                    //if ($scope.divs.length === 0) {
                                    //    $scope.setSelected(div);
                                    //}
                                    divScope.visible = true;
                                    $scope.divs.push(divScope);

                                    if ($scope.divs.length > 1)
                                        {
                                            document.getElementsByClassName("kSliderDivs-home")[0].style.display = 'block';
                                        }
                                    else
                                        {
                                            document.getElementsByClassName("kSliderDivs-home")[0].style.display = 'none';
                                        }

                                };

                        },
                    link: function ($scope, element, attrs)
                        {

                            $scope.links = [];
                            //var divs

                            //$scope.setSelected = function (div) {
                            //    angular.forEach($scope.divs, function (div) {
                            //        divs.selected = false;
                            //    });
                            //    divs.selected = true;
                            //};

                            $scope.select = function (id)
                                {
                                    if (id > $scope.divs.length - 1)
                                        {
                                            $scope.divSelected = 0;
                                        }
                                    else if (id < 0)
                                        {
                                            $scope.divSelected = $scope.divs.length - 1;
                                        }
                                    else
                                        {
                                            $scope.divSelected = id;
                                        }
                                };

                            //$scope.$watch('divSelected', function (nv, ov) {
                            //    if (angular.isDefined(nv)) {
                            //        //var objMain = element;
                            //
                            //
                            //
                            //
                            //        var objCurrentDiv = objDivs[nv];
                            //        var pos = objCurrentDiv.getBoundingClientRect();
                            //
                            //        objMain.style.width= pos.width+"px";
                            //        objMain.style.height= pos.height+"px";
                            //
                            //        objMainContent.style.left="-" + objPositions[nv] + "px";
                            //
                            //        //debugger;
                            //        //$scope.setSelected( $scope.divs[parseInt(nv)]);
                            //    }
                            //});
                            //

                            var objDivs = [];
                            //$scope.divVisible = [];//to be used for several things. contains data,size,visible
                            var objMain = null;
                            var objMainContent = null;
                            //var objPositions = [0];

                            $timeout(function ()
                            {
                                //    $scope.divSelected = 1;
                                //    $scope.links = [];
                                //    objDivs = element.find('.kSliderDiv');
                                //    for( var i=0 ; i< objDivs.length ; i++)
                                //        $scope.links.push(i);

                                objMain = element.find('.kSliderDivs-main')[0];
                                objMainContent = element.find('.kSliderDivs-main-content')[0];

                                var tempObjs = element.find('.kSliderDiv');

                                var width = 0;
                                var maxHeight = 0;
                                var maxWidth = 0;

                                for (var i = 0; i < tempObjs.length; i++)
                                    {
                                        //width += tempObjs[i].getBoundingClientRect().width;
                                        //objPositions.push(width);
                                        //$scope.divVisible.push(false);
                                        var currentWidth = tempObjs[i].getBoundingClientRect().width;
                                        var currentHeight = tempObjs[i].getBoundingClientRect().height;

                                        maxHeight = Math.max(maxHeight, currentHeight);
                                        maxWidth = Math.max(maxWidth, currentWidth);

                                        objDivs.push({
                                            element: tempObjs[i],
                                            width: currentWidth,
                                            height: currentHeight
                                        });
                                    }

                                objMain.style.height = maxHeight + "px";
                                objMain.style.width = (maxWidth + 40 ) + "px";//40px more for arrows
                                objMainContent.style.height = maxHeight + 14 + "px";//+14 if there is box shadow
                                objMainContent.style.width = maxWidth + 14 + "px";//+14 if there is box shadow


                                $scope.$watch('divSelected', function (nv, ov)
                                {
                                    if (angular.isDefined(nv))
                                        {
                                            //var objMain = element;

                                            for (var i = 0; i < $scope.divs.length; i++)
                                                $scope.divs[i].visible = false;
                                            $scope.divs[nv].visible = true;

                                            //for (var i = 0; i < $scope.divVisible.length; i++)
                                            //    $scope.divVisible[i] = false;
                                            //$scope.divVisible[nv] = true;
                                            //

                                            var objCurrentDiv = objDivs[nv].element;

                                            /* Transition Effects */
                                            switch ($scope.effect)
                                            {
                                                case 'swipe':
                                                    {
                                                        objDivs[ov].element.style.left = objMainContent.getBoundingClientRect().width + "px";
                                                        objDivs[nv].element.style.left = -objDivs[nv].element.getBoundingClientRect().width + "px";
                                                    }
                                            }

                                            //var pos = objCurrentDiv.getBoundingClientRect();

                                            objCurrentDiv.style.left = (objMainContent.getBoundingClientRect().width - objDivs[nv].width) / 2 + "px";
                                            objCurrentDiv.style.top = (objMainContent.getBoundingClientRect().height - objDivs[nv].height ) / 2 + "px";

//                                            objMain.style.width = pos.width + "px";
                                            //objMain.style.height= pos.height+"px";

                                            //objMainContent.style.left = "-" + objPositions[nv] + "px";

                                            //debugger;
                                            //$scope.setSelected( $scope.divs[parseInt(nv)]);


                                        }
                                });

                                $scope.divSelected = 0;


                            }, 0)

                        }
                };
            }
        ]);
        angular.module('components.widgets').directive("kSliderDiv", function ()
        {
            return {
                require: '^kSliderDivs',
                restrict: 'E',
                transclude: true,
                scope: {
                    divTitle: '@',
                    click: '&'
                },

                template: "<div ng-show='visible' class='kSliderDiv' ng-transclude></div>",

                link: function (scope, element, attrs, divsCtrl)
                    {
//                        scope.visible = false;
                        divsCtrl.addDiv(scope);
                    }
            };
        });

    })
();
