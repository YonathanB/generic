/***********************************************
 * File Name:
 * Created by: Yonathan Benitah
 * On: 07/11/2016  11:30
 * Last Modified: 07/11/2016
 * Modified by: ybenitah
 ***********************************************/
(function () {
    angular.module('web.controllers')
        .directive('roomController', function () {
            return {
                restrict: 'E',
                replace: true,
                template: '<div class="iframe-container" >' +
                '<iframe id="88RC" ng-src="{{embedUrl}}" onload="FrameManager.registerFrame(this)"></iframe>' +
                '</div>',
                scope: {
                    ip: '@',
                    onReady: '&'
                },

                link: function (scope, el, attr) {
                    el.find("iframe")[0].onload = function (data) {
                        scope["onIframeLoaded"](data);
                    };
                },
                controller: function ($scope, $sce, $timeout) {
                    $scope["onIframeLoaded"] = function (data) {
                        var win = document.getElementById("88RC").contentWindow;
                        if (win == null || !window['postMessage'])
                            alert("oh crap");
                        else
                            win.postMessage("hello", "*");
                        $timeout(function(){
                            $scope.onReady();
                        }, 1500)
                    };

                    $scope["embedUrl"] = $sce.trustAsResourceUrl($scope.ip);
                }
            };
        });
    angular.module('web.controllers').controller('roomCtrl',
        ['$scope', '$timeout', '$sce', 'UniBuilder', function ($scope, $timeout, $sce, UniBuilder) {

            $scope.roomControllerIP = 'http://'+(isDebug? debugURL:location.host + ':8080') ;
            $scope.kLoader = {active: true};
            $scope.showFrame = function(){
                $scope.kLoader.active = false;
            }
            $scope.toggleRoomCtrl = function(activeTab){
                if( activeTab === 'panel') {
                    $scope.panelActive = 'panel';
                }
                else {
                    $scope.panelActive = 'uniBuilder';
                }
            };
            $scope.reloadRC = function(){
                var ifr=document.getElementById('88RC'); ifr.src=ifr.src;
            };
            $scope.panelActive = 'panel';

            $scope.KramerControlLimitation = false;
            $scope.closeKramerControlLimitation = function () {
                $scope.KramerControlLimitation = false;
            };
            $scope.openKramerControlLimitation = function () {
                $scope.KramerControlLimitation = true;
            };


            if(UniBuilder)
                $scope.uniBuilderIP = $sce.trustAsResourceUrl("http://"+(location.host+":8082"));
        }])
})();
