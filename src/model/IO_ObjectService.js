/***********************************************
 * File Name:
 * Created by: Yonathan Benitah
 * On: 06/11/2016  13:44
 * Last Modified: 06/11/2016
 * Modified by: ybenitah
 ***********************************************/



(function () {
    var app = angular.module('model');

    // VideoPatternService
    app.factory("VideoService", ['Commands', 'DataProxy',
        function (Commands, DataProxy) {
        var _patterns = [{
            label: 'None',
            value: 0
        }, {
            label: 'Horizontal bar',
            value: 6
        }, {
            label: 'Color bar',
            value: 8
        }, {
            label: 'Gray gradient',
            value: 9
        }, {
            label: 'Blue square',
            value: 10
        }];
        var  _autoSwith = [];
        var _patternInitialized = false;


        return {
            patterns: function () { return _patterns} ,
            pushToAutoSwitch: function (port) {
                _autoSwith.push(port);
            },
            //TODO - autoswitch it s a matrix feature, should be moved to K_Matrix
            getVideoSwitch: function () {
                return _autoSwith;
            },
            patternInitialized : function(){return _patternInitialized;},
            initPatterns: function () {
                //TODO turn into array in function itself
                return DataProxy.send([Commands.VIDEO_PATTERN_LIST])
                    .then(function (data) {
                        var patterns = Commands[data[0].commandKey].parserOnMessage(data[0].value).value;
                        var updatedPatterns = [];
                        for (var i = 0; i < patterns.length; i++) {
                            updatedPatterns.push({
                                "value": i,
                                "label": patterns[i]
                            });
                        }
                        _patterns = updatedPatterns;
                        _patternInitialized = true;
                    });
            }
        }
    }]);


    app.factory("Authentication", [function () {
        var _enable = {};
        var timeout = null;
        var password = null;

        return {
            enable: _enable,
            set: function(value){
                _enable = value
            },
            get: function(){
                return _enable;
            }
        };
    }])
})();
