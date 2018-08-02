/***********************************************
 * File Name:
 * Created by: Yonathan Benitah
 * On: 09/08/2016  08:17
 * Last Modified: 09/08/2016
 * Modified by: ybenitah
 ***********************************************/
(function () {
    angular.module('components.widgets')
        .directive('kLoader', function () {
            return {
                template: '<ng-transclude></ng-transclude><div class="wrapper" ng-show="kLoader.active"> <div class="flex-container center middle"><div class="loader">' +
                '<div class="circle"></div><div class="circle"></div><div class="circle"></div><div class="circle"></div> <div class="circle"></div> ' +
                '</div></div></div> ',
                restrict: 'A',
                transclude: true,
                scope: {
                    kLoader: "=kLoader"
                },
                link: function(scope, $elem, attrs){
                        var $wrapper = $elem.find('.wrapper');
                        $wrapper.css({
                            'background-color':'#303030',
                            'opacity':'0.6'
                        });
                }
            };
        });
})();