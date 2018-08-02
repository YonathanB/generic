(function(){
angular.module('components.matrix')
    .filter('portFilter', function () {
    return function (items, field, property) {
        if (!field)
            return items;
        else {
            var result = [];
            angular.forEach(items, function (value, key) {
                if (value.selectedPort && _.intersection(value[property], field).length > 0) {
                    result.push(value);
                }
            });
            return result;
        }
    };
})
    .filter('signalFilter', function () {
        return function (items, signals) {
            if (!signals)
                return items;
            else {
                var result = [];
                angular.forEach(items, function (value, key) {
                   if(signals.indexOf(value) > -1)
                       result.push(value);
                });
                return result;
            }
        };
    })
    .filter('isFullConnected', function () {
        return function (inputSignals, outputPort, filters, supportedSignals, inputId) {
            if (!inputSignals || !outputPort) return;
            var currFilter = (filters.length == 0) ? supportedSignals : filters;
            var connection = 0;

            outputPort.connections = {};

            for (var i = 0; i < currFilter.length; i++)
                if (angular.isDefined(inputSignals[currFilter[i]]) && inputSignals[currFilter[i]].indexOf(outputPort.id) > -1) {
                    connection++;
                    outputPort.connections[currFilter[i]] = inputId;
                }


            outputPort.isFullConnected = (connection == currFilter.length);

            // if(!scope.isFullConnected)

            return connection == 0 ? '' : outputPort.isFullConnected ? 'full-connected' : 'partial-connected';
        };
    });
})()
