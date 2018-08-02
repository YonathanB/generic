/***********************************************
 * File Name: kEdid.js
 * Created by: fassous
 * On: 14/05/2015 14:27
 * Last Modified:
 * Modified by:
 ***********************************************/
//type: 0=input , 1=output, 2=default

(function () {
    angular.module('components.widgets').directive("kEdid", function () {
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                type: '@',
                channel: '@',
                data: '=',
                selected: '=',
                visible: '=',
                controlClass: '@',
                setClick: '&',
                setClickLock: '&',
                active: '=',
                enabled: '=',
                isLockable: "=",
                showSignal:"=",
                hasSignal:"="
            },
            template: '\
            <div  \
                ng-show="visible" \
                ng-click="internalClick()"\
                ng-class="{disabled : !enabled , active : selected && enabled , connected: type==1 && data.signalType!=0 ,disconnected:type==1 && data.signalType==0}" \
                class="kEdid kContentButton {{controlClass}}"\
                data-edid-channel="{{channel}}" \
                data-edid-type="{{type}}" \
                >\
                    <p class="edid-type" ng-if="data.label != undefined && data.label!=\'\'">{{data.label}}</p>\
                    <p class="edid-type" ng-if="data.label == undefined || data.label==\'\'"\
                       ng-switch on="type">\
                        <span ng-switch-when=0>Input {{channel}}</span>\
                        <span ng-switch-when=1>Output {{channel}}</span>\
                        <span ng-switch-when=2>Default</span>\
                        <span ng-switch-when=3>File</span>\
                        <span ng-switch-default></span>\
                    </p>\
                    <div class="edid-signal"\
                        ng-show="showSignal"\
                        ng-class="{on:hasSignal}"\
                        title="{{hasSignal ? \'Connected\' : \'No Signal\'}}">\
                    </div>\
                    <k-button-icon \
                            control-class="lock-edid" \
                            visible="isLockable" \
                            active="data.isLocked" \
                            title= "click to lock/unlock EDID" \
                            icon-class="icon_lockOff_10x10" \
                            icon-active-class="icon_lockOn_10x10" \
                            click="setClickLock()" \
                            stop-propagation="true"></k-button-icon>\
                    <div  class="edid-details">\
                        <p class="edid-noedid" ng-if="!enabled && data.signalType==1">No EDID</p>\
                        <p class="edid-model">{{data.model}}</p>\
                        <p class="edid-res">{{data.res}}</p>\
                        <p class="edid-deepColor">{{data.deepColor}}</p>\
                        <p class="edid-audio">{{data.audio}}</p>\
                        <p class="edid-size">{{data.edidLength}}</p>\
                        <div ng-transclude></div>\
                    </div>\
            </div>',
            compile: function (element, attrs) {
                if (!attrs.type)
                    attrs.type = "default";
                if (!attrs.channel)
                    attrs.channel = "";
                if (!attrs.data)
                    attrs.data = "{}";
                if (!attrs.selected)
                    attrs.selected = "false";
                if (!attrs.visible)
                    attrs.visible = "true";
                if (!attrs.enabled)
                    attrs.enabled = "true";
                if (!attrs.controlClass)
                    attrs.controlClass = "";
                if (!attrs.isLockable)
                    attrs.isLockable = "false";
                if (!attrs.showSignal)
                    attrs.showSignal = "false";
                if (!attrs.hasSignal)
                    attrs.hasSignal = "false";
                return this.link;
            },
            link: function (scope, element, attrs) {

                //scope.internalClick = function () {
                //    if(scope.enabled) {
                //        //scope.selected = !scope.selected;// for target
                //        scope.setClick();
                //    }
                //};

//                scope.enabled = scope.data.signalType==2 || scope.type != 1;


//scope.getClass = function(){
//    toReturn = {
//        disabled : !scope.enabled ,
//        active : scope.selected && scope.enabled ,
//        connected: scope.type==1 && scope.data.signalType!=0 ,
//        disconnected:scope.type==1 && scope.data.signalType==0
//    }
//    if(typeof scope.test =="undefined")
//        scope.test=0;
//    scope.test++;
//    return toReturn;
//}
                if (!scope.setClick) {
                    scope.setClick = function () {
                        alert("kEdid setClick: Not implement")
                    };
                }

                scope.internalClick = function () {
                    //$timeout(function ()
                    //{
                    //    scope.$apply(function ()
                    //    {
                    //        scope.hoverClass = '';
                    //    });
                    //});

                    if (scope.enabled)
                        scope.setClick();
                };


            }
        };
    });
})();


