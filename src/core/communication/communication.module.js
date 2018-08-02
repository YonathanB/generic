

export default require('angular')
    .module('core.communication', [])
    .factory('CommunicationFactory', ['WebSocket', 'Polling',
        function (WebSocket, Polling) {

            var _serviceTypes = {
                'ws': WebSocket,
                'http': Polling
            };

            return function (communicationService, host, protocol) {
                if (angular.isUndefined(host))
                    host = location.host;
                return _serviceTypes[communicationService](host, protocol); // $communication;
            }
        }])
    .name;

require('./Polling');
require('./WebSocket');
