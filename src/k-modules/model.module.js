import $data from '../core/data/data.module';
import {K_Module, K_Matrix} from './ModuleFactory'


export default require('angular')
    .module('kModules', [$data])
    .service('K_Module', K_Module)
    .service('K_Matrix', K_Matrix)
    .constant('$_KRAMER_MODULES', {
        MATRIX: 'MATRIX',
        DEVICE_PROPERTIES: 1,
        NETWORK_PROPERTIES: 2,
        GLOBAL: 3
    })
    .factory('K_ModuleFactory', ['$_KRAMER_MODULES', 'Commands', '$q', '$rootScope',
        function ( $_KRAMER_MODULES, Commands, $q, $rootScope) {

        let _modules = {};
            _modules[$_KRAMER_MODULES.MATRIX] = K_Matrix;

            return {
                createModule: _createModule
            };


            function _createModule(module, data) {
                console.log("implement K_Module factory");

                // var moduleCreated = new K_Module(data.commands, data.only_get_commands, data.retryAttemptsOnFailed);
                let moduleToCreate = module.toUpperCase();
                let moduleCreated = null;
                switch (moduleToCreate) {
                    case 'MATRIX':
                    case 'PORT':
                        moduleCreated = new _modules[moduleToCreate](data, Commands, $q, $rootScope);
                        break;
                    default:
                        moduleCreated = new K_Module(data, Commands, $q, $rootScope);
                }
                return moduleCreated;
            }
        }])

    .name;

// require('./ModuleFactory');
