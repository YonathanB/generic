/***********************************************
 * File Name: kCenter.js
 * Created by: Chezi Hoyzer
 * On: 21/09/2014  12:45
 * Last Modified: 21/09/2014
 * Modified by: Choyzer
 ***********************************************/
(function ()
    {
        angular.module('components.widgets').directive("kCenter", function ()
        {
            return {
                restrict: 'E',
                transclude: true,
                replace: true,
                template: '<div  class="k-center-outer">\
                         <div  class="k-center-container">\
                             <div class="tableRow">\
						          <div class="k-center-container-centered" ng-transclude>\
						          </div>\
                             </div>\
                          </div>\
				       </div>'
            };
        });
    })();