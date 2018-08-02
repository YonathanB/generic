import $widget from '../widgets/widgets.module';
import {RoutingCtrl} from './routing';

RoutingCtrl.$inject = [
    '$filter',
    'ConnectorsFactory',];

export default require('angular')
    .module('components.matrix', [$widget])
    .directive('stringToNumber', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                ngModel.$parsers.push(function (value) {
                    return '' + value;
                });
                ngModel.$formatters.push(function (value) {
                    return parseFloat(value);
                });
            }
        };
    })
    .component('routing', {
        bindings:{vm:'<'},
        template: require('./routing.html'),
        controller: RoutingCtrl
    })
    .name;


require('./directives/kMatrix.directive');
require('./directives/kPort.directive');
require('./directives/kPortInfo.directive');
require('./filters/matrix.filter');
require('./services/ConnectorsFactory');
// require('./services/IO_ObjectService');