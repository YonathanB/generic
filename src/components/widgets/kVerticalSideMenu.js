/***********************************************
 * File Name: kVerticalSideMenu.js
 * Created by: Chezi Hoyzer
 * On: 21/09/2014  14:24
 * Last Modified: 21/09/2014
 * Modified by: Choyzer
 ***********************************************/
(function () {
    angular.module('components.widgets').directive("kVerticalSideMenu", ['$timeout', function ($timeout) {
        return {
            restrict: 'E',
            transclude: true,

            scope: {
                enabled: '='
            },

            template: "\
                    <div id='menuContainer' class='kVerticalSideMenu' ng-class='{disabled:!enabled, icons: icons, off: !menuOpen}'>\
					    <div class='sideMenu-content' ng-transclude></div>\
                        <div class='sideMenu-menuContainerCover'></div>\
                        <div ng-click='onOff()' class='sideMenu-halfCycle' >\
                            <div class='sideMenu-arrowArea'>\
                                <div class='sideMenu-arrow' >\
                                </div>\
                            </div>\
                        </div>\
				    </div>\
				    ",
            templateOLD: "\
                    <div id='menuContainer' class='kVerticalSideMenu'>\
					    <div ng-transclude></div>\
				    </div>\
				    <div id='menuContainerCover' style='display: none'>\
				    </div>\
                    <div id='toggleMenuDiv'>\
                       <div id='imgOpenMenu' ng-click='toggleMenuDiv();'>\
                           <div id='halfCycle'>\
                               <div id='arrowArea'>\
                                   <div ng-class='{\"arrow-right\" : isOpen, \"arrow-left\" : !isOpen}' ng-click='onOff()' ng-attr-style={{arrowSideStyle}}>\
                                   </div>\
                               </div>\
                           </div>\
                       </div>\
                    </div>",

            compile: function (element, attrs) {
                if (!attrs.enabled)
                    attrs.enabled = "true";


                if(angular.isDefined(attrs.icons)) {
                    attrs.menuOpen = (attrs.icons === 'open');
                    attrs.icons = true;
                }else  {
                    attrs.menuOpen = true;
                    attrs.icons = false;
                }

                return this.link;
            },
            link: function (scope, element, attrs) {
                scope.icons = attrs.icons;
                scope.menuOpen = attrs.menuOpen;
                scope.onOff = function () {
                    var obj = element[0].children[0];
                    var objBox = document.getElementById('contentBox');

                    if (obj.classList.contains('off')) {
                        obj.classList.remove('off');
                        if(objBox)
                            objBox.classList.remove('full');
                    }
                    else {
                        obj.classList.add('off');
                        if(objBox)
                            objBox.classList.add('full');
                    }
                };
            }
        };
    }]);
})();