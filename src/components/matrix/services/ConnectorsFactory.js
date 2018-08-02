(function () {
    angular.module('components.matrix')

        .factory("ConnectorsFactory", [function () {
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

            var _switchablePorts = [];

            return {
                ports: _ports,
                masterSignal: _masterSignal,
                switchablePorts: _switchablePorts,
                signalsToPort: _signalsToPort
            };
        }])
})();