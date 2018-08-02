(function () {
    var app = angular.module('model');

    app.factory("ConnectorsFactory", [function () {
        var _ports = {
            HDBT: ['VIDEO', 'AUDIO', 'RS232', 'IR', 'USB'],
            HDMI: ['VIDEO', 'AUDIO'],
            IR: ['IR'],
            USB_A: ['USB'],
            USB_B: ['USB'],
            ANALOG_AUDIO: ['AUDIO'],
            MIC: ['AUDIO'],
            AMPLIFIED_AUDIO: ['AUDIO'],
            RS232: ['RS232']
        };

        var _signalsToPort = {
            'VIDEO': ['HDMI', 'HDBT', 'DVI', 'VGA'],
            'AUDIO': ['HDMI', 'HDBT', 'ANALOG_AUDIO', 'MIC', 'AMPLIFIED_AUDIO'],
            'IR': ['HDBT', 'IR'],
            'USB': ['HDBT', 'USB_A', 'USB_B'],
            'RS232': ['HDBT', 'RS232']
        };

        var _masterSignal = {
            HDBT: 'VIDEO',
            HDMI: 'VIDEO'
        };

        var  _switchablePorts = [];

        return {
            ports: _ports,
            masterSignal: _masterSignal,
            switchablePorts: _switchablePorts,
            signalsToPort: _signalsToPort
        };
    }]);
    // VideoPatternService
    app.factory("VideoService", ['Commands', 'K_ProxyService',
        function (Commands, K_Proxy) {
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
                getVideoSwitch: function () {
                    return _autoSwith;
                },
                patternInitialized : function(){return _patternInitialized;},
                initPatterns: function () {
                    //TODO turn into array in function itself
                    return K_Proxy.send([Commands.VIDEO_PATTERN_LIST])
                        .then(function (data) {
                            var patterns = data[0].cmd.parserOnMessage(data[0].value).value;
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