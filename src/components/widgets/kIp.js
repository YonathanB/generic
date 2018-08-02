/**
 * Created by Choyzer on 13/10/2014.
 */
/***********************************************
 * File Name: kIp.js
 * Created by: Chezi Hoyzer
 * On: 13/10/2014  12:30
 * Last Modified: 13/10/2014
 * Modified by: Choyzer
 ***********************************************/


(function ()
{

    angular.module('components.widgets').directive("kIp", function ()
    {
        return {
            restrict: 'E',
            scope: {
                enabled: '=',
                value: '=',
                initVal: '@',
                kOnBlur: '&',
                title: '@',
                controlInputClass: '@',
                controlClass: '@'
            },

            template: "<div class='kIp ipWarp {{controlClass}}' ng-attr-title='{{title}}' ng-class='{disabled:!enabled}'>\
                                <k-input-range k-on-blur='kOnBlur()'  allow-empty='true' allow-zero='true' is-tab-next='true'  max='{{max}}' min='{{min}}' value='octet1' enabled='enabled' value-to-listen='valuetolisten' init-val='{{octet1Init}}'  control-class='inputIP inputIPLeft marginTop' control-input-class=='{{controlInputClass}}'></k-input-range>\
                                <div class='dotIp'>.</div>\
                                <k-input-range k-on-blur='kOnBlur()'  allow-empty='true' is-back-prev='true' allow-zero='true' is-tab-next='true'  max='{{max}}' min='{{min}}' value='octet2' enabled='enabled' value-to-listen='valuetolisten' init-val='{{octet2Init}}'  control-class='inputIP inputIPMiddle marginTop' control-input-class=' {{controlInputClass}}'></k-input-range>\
                                <div class='dotIp'>.</div>\
                                <k-input-range k-on-blur='kOnBlur()' allow-empty='true' is-back-prev='true' allow-zero='true' is-tab-next='true'  max='{{max}}' min='{{min}}' value='octet3' enabled='enabled' value-to-listen='valuetolisten' init-val='{{octet3Init}}'  control-class='inputIP inputIPMiddle marginTop' control-input-class=' {{controlInputClass}}' ></k-input-range>\
                                <div class='dotIp'>.</div>\
                                <k-input-range k-on-blur='kOnBlur()'  allow-empty='true' is-back-prev='true' allow-zero='true'  max='{{max}}' min='{{min}}' value='octet4' enabled='enabled' value-to-listen='valuetolisten' init-val='{{octet4Init}}'  control-class='inputIP inputIPRight marginTop' control-input-class=' {{controlInputClass}}'></k-input-range>\
                           </div>",

            compile: function (element, attrs)
            {
                if (!attrs.value)
                { attrs.value = ""; }
                if (!attrs.enabled)
                { attrs.enabled = true; }
                if (!attrs.title)
                { attrs.title = "" }
                return this.link;
            },
            link: function (scope, el, attrs)
            {
                scope.min=0;
                scope.max=255;
                scope.valuetolisten = 0;//needed for k-input-range

                scope.$watch('initVal', function (val)
                {
                    if (val) {
                        var octets = val.split(".");
                        scope.octet1Init = parseInt(octets[0]);
                        scope.octet2Init = parseInt(octets[1]);
                        scope.octet3Init = parseInt(octets[2]);
                        scope.octet4Init = parseInt(octets[3]);
                        scope.octet1 = parseInt(octets[0]);
                        scope.octet2 = parseInt(octets[1]);
                        scope.octet3 = parseInt(octets[2]);
                        scope.octet4 = parseInt(octets[3]);
                    }
                });

                scope.$watchCollection('[octet1,octet2,octet3,octet4]', function (val){
                    if (val) {
                        scope.value = val[0] + "." + val[1] + "." + val[2] + "." + val[3];
                    }
                });

            }
        };
    });
})();

