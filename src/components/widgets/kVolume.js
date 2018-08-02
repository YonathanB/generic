/***********************************************
 * File Name: kVolume.js
 * Created by: fassous
 * On: 12/07/2015 09:58
 * Last Modified:
 * Modified by:
 ***********************************************/


(function () {
    angular.module('components.widgets').directive("kVolume", ['$timeout', function ($timeout) {

        return {
            restrict: 'E',
            transclude: true,
            scope: {
                min: '@',
                max: '@',
                valueToListen: '=',
                initVal: '@',
                mutedInitVal: '@',
                orientation: '@',
                onValueToListenChanged: '&', // must use like this: setClickFunctionName(insideVal) for deliver the value into the function
                onValueChanged: '&', // must use like this: setClickFunctionName(insideVal) for deliver the value into the function
                onStateChanged: '&',// must use like this: setClickFunctionName(insideVal) for deliver the mute status into the function
                visible: '=',
                enabled: '=',
                controlClass: '@',
                controlStateClass:'@',
                iconState: '@',
                iconDisableState: '=?',
                iconStates: '=?',
                showInput: '=',
                showProgress:'=',
                showZero: '=',
                showValue: '=',
                timeout:'@',
                titleSliderLine:"@",
                titleInput:"@",
                unit:'@',
                enableSliderOnMute: '=',
                enableSliderOnChange: '=',
                decimals: '@',
                roundingTo: '@',
                steps:'@',
                validateOnArrow: '=',
                validateOnEnter: '='
            },
            template:'\
<div ng-show="visible" class="kVolume {{controlClass}}" ng-class="{\'disabled\':!enabled,\'volume-vertical\':orientation==\'V\'}">\
    <div class="kVolume-header"ng-transclude></div>\
     <div class="kVolume-icon" ng-if="orientation!=\'V\'">\
     <k-state-button state-control-class="{{controlStateClass}} button-mute" onaction="enabled && iconOnAction()" enabled="enabled" states="iconStates" state="{{iconState}}" disabledstate="iconDisableState"></k-state-button>\
     </div>\
    <k-slider \
        enabled="enabled && ( !muted || enableSliderOnMute)" \
        enabled-click-on-max="false"\
        min="{{min}}" \
        max="{{max}}" \
        init-val= "{{initVal}}" \
        control-class= "kVolume-slider"\
        show-input="showInput"\
        show-arrows="false"\
        show-progress="showProgress"\
        show-zero="showZero" \
        show-min-max="true"\
        show-input-arrows="false"\
        show-value="showValue"\
        orientation= "{{orientation}}" \
        unit= "{{unit}}"\
        click-steps= "10"\
        value-to-listen="valueToListen"\
        timeout="{{timeout}}"\
        title-slider-line="{{titleSliderLine}}"\
        title-input="{{titleInput}}"\
        decimals="{{decimals}}" \
        rounding-to="{{roundingTo}}" \
        steps="{{steps}}" \
        validate-on-enter="validateOnEnter" \
        validate-on-arrow="validateOnArrow"\
        >\
     </k-slider>\
     <div class="kVolume-icon" ng-if="orientation==\'V\'">\
     <k-state-button state-control-class="{{controlStateClass}} button-mute" onaction="enabled && iconOnAction()" enabled="enabled" states="iconStates" state="{{iconState}}" disabledstate="iconDisableState"></k-state-button>\
     </div>\
</div>',

            compile: function (element, attrs) {
                if (!attrs.max)
                    attrs.max = 100;
                if (!attrs.min)
                    attrs.min = -20;
                //if (!attrs.value)
                //    attrs.value = attrs.min;
                if (!attrs.visible)
                    attrs.visible = "true";
                if (!attrs.enabled)
                    attrs.enabled = "true";
                if (!attrs.orientation)
                    attrs.orientation = "H";//horizontal
                if (!attrs.iconState)
                    attrs.iconState = 0;
                if (!attrs.timeout)
                    attrs.timeout= "500";
                if (!attrs.showInput)
                    attrs.showInput= "true";
                if (!attrs.showZero)
                    attrs.showZero= "true";
                if (!attrs.unit)
                    attrs.unit= "dB";
                if (!attrs.enableSliderOnMute)
                { attrs.enableSliderOnMute = "false" }
                if (!attrs.enableSliderOnChange)
                { attrs.enableSliderOnChange = "false" }
                if (!attrs.mutedInitVal)
                { attrs.mutedInitVal= "false" }
                if (!attrs.decimals)
                    attrs.decimals= "0";
                if (!attrs.roundingTo)
                    attrs.roundingTo= "1";
                if (!attrs.steps)
                    attrs.steps = "1";
                if (!attrs.validateOnArrow)
                    attrs.validateOnArrow = "true";
                if (!attrs.validateOnEnter)
                    attrs.validateOnEnter = "true";


                return this.link;
            },
            link: function (scope, element, attrs) {

                scope.$watch('initVal', function (nv)
                {
                    if (angular.isDefined(nv))
                    {
                        if (utils.isTrue(scope.enableSliderOnChange))
                        {
                            scope.muted = false;
                        }
                    }
                });

                scope.$watch('mutedInitVal', function (nv)
                {
                    if (angular.isDefined(nv))
                    {
                        scope.muted = utils.isTrue(nv);
                    }
                });

                scope.$watch('valueToListen', function (nv) {
//                    validateValue(nv);
                    if (angular.isDefined(nv)) {
                        scope.onValueToListenChanged({insideVal: nv});
                    }
                });

                scope.$watch("value", function (nv){
                    if (angular.isDefined(nv))
                    {
                        scope.onValueChanged({insideVal: nv});
                    }
                });

                scope.$watch('mutedInitVal', function (nv){
                    if (angular.isDefined(nv))
                    {
                        scope.muted = utils.isTrue(nv);

                        if (scope.muted)
                        {
                            scope.iconState = 1;
                        }
                        else
                        {
                            scope.iconState = 0;
                        }

                    }
                });


                if (!scope.iconStates)
                {
                    scope.iconStates = scope.iconStates = [];
                    scope.iconStates.push({iconClass: "icon-volume-mute", title: "Click to mute"});
                    scope.iconStates.push({iconClass: "icon-volume-mute2", title: "Click to unmute"});
                }

                //scope.$watch("muted", function ()
                //{
                //    if (scope.muted)
                //    {
                //        scope.iconState = 1;
                //    }
                //    else
                //    {
                //        scope.iconState = 0;
                //    }
                //});

                scope.iconOnAction = function ()
                {
                    // scope.muted = !scope.muted;
                    var test = "TEST";
                    scope.onStateChanged({insideVal: !scope.muted});
                };

                scope.iconDisableState = {iconClass: "icon_muteDisabled", title: "Control is disabled"};



            }
        }
    }
    ]);
})();
