
class K_Module {
    constructor(data, Commands, DataProxy, $q, $rootScope) {
        'ngInject';
        let _self = this;
        _self.Commands = Commands;
        _self.$rootScope = $rootScope;
        _self.DataProxy = DataProxy;
        _self.$q = $q;
        _self.initialized = false;

        _self._buildModuleCommands(data.commands);
        _self._buildModuleModel();
        _self._registerCommand();
        if (data.hasOwnProperty('only_get_commands'))
            _self._onlyGetCodes = data.only_get_commands;
        if (data.hasOwnProperty('retryAttemptsOnFailed'))
            _self._retryAttemptsOnFailed = data.retryAttemptsOnFailed;

        _self.init =  function (forceRead) {
            var defered = _self.$q.defer();
            if (_self.initialized && !forceRead) {
                defered.resolve(_self);
                return defered.promise;
            }

            let toGet = [];
            _self._eachRecursive(_self.commands, toGet);
            return _self.DataProxy.get(toGet)
                .then(function (data) {
                    for (var i = 0; i < data.length; i++) {
                        _self._updateModel( data[i]);
                    }
                    _self.initialized = true;
                    return _self;
                })
        };
        _self.get = function (dataToGet) {
            return _self.DataProxy.get(dataToGet).then(function (data) {
                return data;
            })
        };
        _self.update =  function (dataToUpdate) {
            var toUpdate = [];
            for (var prop in dataToUpdate) {
                if (typeof dataToUpdate[prop] !== 'object') {
                    if (dataToUpdate[prop] !== _self.commands[prop].value) {
                        _self.commands[prop].value = dataToUpdate[prop];
                        toUpdate.push(_self.commands[prop])
                    }
                } else {
                    for (var subProp in dataToUpdate[prop]) {
                        if (dataToUpdate[prop][subProp] !== _self.commands[prop][subProp].value) {
                            _self.commands[prop][subProp].value = dataToUpdate[prop][subProp];
                            toUpdate.push(_self.commands[prop][subProp])
                        }
                    }
                }
            }
            // var toUpdate = _self.onUpdate(dataToUpdate);
            if (toUpdate.length > 0) {
                return _self.DataProxy.put(toUpdate).then(function (data) {
                    return _self.$q.resolve({'obj': _self, 'data': data});
                }, function (err) {
                    console.log('ERROR WHILE FETCHING DATA');
                    return $_self.q.reject(err);
                });
            }
        },
            _self.notify = function (data) {
                _self._updateModel(data);
            };
        _self.registerCommand = _self._registerCommand
    }





    /**
     *
     * @param commands
     * @private
     * @description
     * For each module command we are creating a copy with its specific params
     */
    _buildModuleCommands(commands) {
        var _self = this;
        if (commands && commands.length > 0) {
            _self.commands = [];
            let _cmd;
            for (let i = 0; i < commands.length; i++) {
                if (typeof commands[i] === "string") {
                    _cmd = commands[i].split(' ');
                    commands[i] = _self.Commands.commandsByOpCode[_cmd[0]]
                }

                // register new commands to module
                if (!_self.commands.hasOwnProperty(commands[i].key))
                    _self.commands[commands[i].key] = {};

                if (_cmd[1]) { // command with params
                    commands[i].parserOnSend(_cmd[1]);
                    _self.commands[commands[i].key][commands[i].params.join(',')] = angular.copy(commands[i]);
                } else _self.commands[commands[i].key] = angular.copy(commands[i]);
            }
        } else
            _self.commands = null;
    }

    /**
     *
     * @private
     * @description
     * According to module's commands we are creating a model for module's data
     */
    _buildModuleModel() {
        var _self = this;
        if (_self.commands) {
            _self.data = {};
            for (let cmdKey in _self.commands) {
                if (!_self.data.hasOwnProperty(cmdKey)) {
                    _self.data[cmdKey] = {};
                    _self.$rootScope.$watch(function(){
                        return _self.data[cmdKey];
                    }, function onChange( newValue, oldValue,){
                        console.log('Change value ', newValue);
                        console.log('Change value origin', _self.commands[cmdKey].value);
                    }, true)
                }
                for (let i = 0; i < _self.commands[cmdKey].length; i++) {
                    if (_self.commands[cmdKey][i].params) {
                        _self.data[cmdKey][_self.commands[cmdKey][i].params.join(',')] = {};
                        _self.$rootScope.$watch(function(){
                            return _self.data[cmdKey][_self.commands[cmdKey][i].params.join(',')];
                        }, function onChange( newValue, oldValue,){
                            console.log('Change value ', newValue);
                            console.log('Change value origin', _self.commands[cmdKey][_self.commands[cmdKey][i].params.join(',')].value);
                        })
                    }
                }
            }
        }
    }

    // register the command to data Proxy so each time data will come our module will be notified
    _registerCommand() {
        var toRegister = [];
        this._eachRecursive(this.commands, toRegister);
        toRegister.map(cmd => this.DataProxy.moduleRegister(this, {key: cmd.key, fn: this.update}))

    }

    //some commands are arrays because one command can be duplicate for each param
    // That recursive function will flatten commands' object
    _eachRecursive(obj, arr) {
        for (let k in obj) {
            if (obj[k].hasOwnProperty('opCode'))
                arr.push(obj[k]);
            else
                this._eachRecursive(obj[k], arr);
        }
    }
    /**
     *
     * @param data
     * @private
     * @description
     * Update the module's model
     */
    _updateModel(data) {
        if (data.params) {
            this.data[data.cmd.key][data.params] = data.value;
            this.commands[data.cmd.key][data.params].value = data.value;
        } else this.commands[data.cmd.key].value = this.data[data.cmd.key] = data.value;
    }

}

class K_Matrix extends K_Module {
    constructor(data,  Commands, DataProxy, $q, $rootScope) {
        super(data,  Commands, DataProxy, $q, $rootScope);
    }
}
export {
    K_Module,
    K_Matrix
}

// import {Commands} from '../core/Commands';
// (function (Commands) {
//

// var reloadWeb = function (field, newIP) {
//     if (angular.isDefined(_deviceData[field])) {
//         if (field == 'NET_CONFIG')
//             newIP = newIP.split(',')[0];
//         if (newIP != location.host && location.host.indexOf("localhost") === -1) {
//             $rootScope.launchGlobalMessage("IP has changed you'll be redirected soon!", 5);
//             $timeout(function () {
//                 window.location = "http://" + newIP;
//             }, 500);
//         }
//     }
//
// };
// var _initValues = function (data, firstInit) {
//     for (var field in this.data) {
//         for (var i = 0; i < data.length; i++) {
//             if (angular.isDefined(this.commands[field]) &&
//                 this.commands[field].opCode === data[i].cmd.opCode &&
//                 this.commands[field].key === data[i].cmd.key &&
//                 _validateCommandAndValue(this.commands[field].opCode, data[i].value)) {
//                 // On Success
//                 if (angular.isUndefined(data[i].errCode)) {
//                     if (field == 'NET_IP' || field == 'NET_CONFIG')
//                         reloadWeb(field, data[i].value);
//                     var value = data[i].value;
//                     var param = null;
//                     if (angular.isDefined(data[i].cmd.parserOnMessage) ||
//                         (angular.isDefined(data[i].cmd.parent) && angular.isDefined(data[i].cmd.parent.parserOnMessage))) {
//                         var parsedData = angular.isDefined(data[i].cmd.parserOnMessage) ? data[i].cmd.parserOnMessage(data[i].value, this.data[field])
//                             : data[i].cmd.parent.parserOnMessage(data[i].value, data[i].params);
//                         value = parsedData.value;
//                         if (angular.isDefined(parsedData.params)) {
//                             param = parsedData.params;
//                             // this.data[field][parsedData.params] = parsedData.value;
//                             // TODO reset _deviceData[field][parsedData.params] = parsedData.value;
//                         }
//                     }
//                     if (!param) {
//                         //if(firstInit)
//                         if (angular.isObject(value)) {
//                             this.data[field] = JSON.parse(JSON.stringify(value));
//                         }
//                         else {
//                             this.data[field] = value;
//                         }
//                         _deviceData[field] = value;
//                     }
//                     else {
//                         if (angular.isUndefined(this.data[field]))
//                             this.data[field] = {};
//                         this.data[field][param] = value;
//                         if (angular.isUndefined(_deviceData[field]))
//                             _deviceData[field] = {};
//                         _deviceData[field][param] = value;
//                     }
//                     if (angular.isDefined(this.updateUI))
//                         this.updateUI({cmd: data[i].cmd.key, param: param, value: value});
//                     break;
//                 }
//
//                 // Retry on Error
//                 else if (angular.isDefined(data[i].cmd.onError)) {
//                     if (data[i].cmd.onError(_retryAttemptsOnFailed))
//                         this.get([data[i].cmd]);
//                 }
//                 // Set previous value on Error
//                 else {
//                     if (angular.isObject(_deviceData[field])) {
//                         this.data[field] = JSON.parse(JSON.stringify(_deviceData[field]));
//                     }
//                     else {
//                         this.data[field] = _deviceData[field];
//                     }
//                 }
//             }
//         }
//     }
// };
// var _validateCommandAndValue = function (command, value) {
//     var validCommandsAndValues = {};
//     validCommandsAndValues["KDS-ACTION"] = {};
//     validCommandsAndValues["KDS-ACTION"][0] = "";
//     validCommandsAndValues["KDS-ACTION"][1] = "";
//     var valid = true;
//     if (angular.isDefined(validCommandsAndValues[command])) {
//         if (!angular.isDefined(validCommandsAndValues[command][value])) {
//             valid = false;
//         }
//     }
//     return valid;
// }

//     angular.module('model')
//         .factory('K_ModuleFactory', ['$q', 'DataProxyService', 'ConnectorsFactory',
//             function ($q, DataProxyService, ConnectorsFactory) {
//                 var factory = this;
//                 class K_Module {
//                     constructor(data) {
//                         let _self = this;
//                         let commands = data.commands;
//                         // properties
//
//                         _self.model = {
//                             data: {},
//                             propertiesUI_Mapping: {}
//                         };
//
//
//                         //methods
//                         _self.buildCommands = function(){
//                             _self.commands = angular.copy(Commands.buildAndReturnCommandsFromOpCode(commands, this.model.data));
//                         };
//                         _self.onUpdate = function () {
//                         };
//                         _self.onInit = function () {
//                         };
//                         _self.notify = function (data) {
//                             var commandKey = data.cmd.key;
//                             data.cmd.value = data.value;
//                             if(data.params) {
//                                 if (_self.model.data[commandKey] == undefined)
//                                     _self.model.data[commandKey] = {};
//                                 _self.model.data[commandKey][data.params] = data.cmd.parserOnMessage.call(this, data.value);
//                             }
//                             else
//                                 _self.model.data[commandKey]= data.cmd.parserOnMessage.call(this, data.value);
//
//                             _self.onUpdate(commandKey);
//
//                         };
//                         _self.init = function () {
//                             let commandsToSend = _self.commands
//                                 .filter(command => !(_self.model.hasOwnProperty(command.key)));
//                             return DataProxyService.send(commandsToSend)
//                                 .then(function (data) {
//                                     return _self.onInit();
//                                 })
//                         };
//
//                     }
//                 }
//
//                 class K_Matrix extends K_Module {
//                     constructor(data) {
//                         super(data);
//                         const _matrixDescriptor = data;
//                         let _self = this;
//                         let portsCommands = {
//                             detail: data.detailDataToLoad,
//                             overview: data.overviewDataToLoad
//                         };
//                         let _portsListById = {};
//
//                         _self.onUpdate = function (cmdKey) {
//                             switch (cmdKey) {
//                                 case Commands.PORTS_LIST.key:
//                                     let tmp = [];
//                                     _self.model.data.PORTS_LIST.forEach(function (portId, index) {
//                                         _portsListById[portId] = _addPort.call(_self, portId);
//                                         tmp[index] = _portsListById[portId].model.data
//                                     });
//                                     _self.model.data.PORTS_LIST = tmp;
//
//                                     if (_self.model.data.hasOwnProperty(Commands.X_PORT_SELECT_LIST.key))
//                                         _updateSwitchablePorts.call(_self);
//                                     break;
//                                 case Commands.X_SET_ROUTE.key:
//                                     DataProxyService.send([Commands.MATRIX_STATUS]);
//                             }
//
//                         };
//                         _self.onInit = function () {
//                             var deferred = $q.defer();
//                             let promises = [];
//                             for (let port in _portsListById) {
//                                 promises.push(_portsListById[port].init());
//                             }
//                             $q.all(promises).then(function (data) {
//                                 deferred.resolve(data)
//                             })
//                             return deferred.promise;
//                         }
//
//
//                         function _updateSwitchablePorts() {
//                             let switchablePorts = _self.model.data.X_PORT_SELECT_LIST;
//                             for (let _switch in switchablePorts) {
//                                 let selectedGroup = switchablePorts[_switch].selected;
//                                 for (let i = 0; i < switchablePorts[_switch].group.length; i++) {
//                                     let group = switchablePorts[_switch].group[i];
//                                     for (let j = 0; j < group.length; j++) {
//                                         _portsListById[group[j]].switchablePort = true;
//                                         _portsListById[group[j]].switchableGroupName = _switch;
//                                         if (i != selectedGroup)
//                                             _portsListById[group[j]].selectedPort = false;
//                                     }
//
//                                 }
//                             }
//                         }
//
//
//                         /**
//                          * @ngdoc function
//                          * @name model.Matrix#_getPortDirection
//                          * @methodOf model.Matrix
//                          * @description some ports are set as _both_, but they should be input or output
//                          * @param {object=} port we want to know its direction
//
//                          * @returns {string} can be input or output
//                          */
//                         function _getPortDirection(port) {
//                             if (_matrixDescriptor.hasOwnProperty('bothPortsDirection')) {
//                                 var toInputsPort = _matrixDescriptor['bothPortsDirection'].input;
//                                 var toOutputsPort = _matrixDescriptor['bothPortsDirection'].output;
//
//                                 if (toInputsPort && toOutputsPort)
//                                     if ((toInputsPort.indexOf(port) > -1 || port.indexOf('IN') > -1) && toOutputsPort.indexOf(port) === -1) return 'input';
//                                     else return 'output';
//                             } else {
//                                 if (port.indexOf('IN') > -1) return 'input';
//                                 else return 'output';
//                             }
//                         }
//
//                         /**
//                          * @ngdoc function
//                          * @name model.Matrix#_addPort
//                          * @methodOf model.Matrix
//                          * @description create a port in matrix
//                          * @param {string=} portId
//
//                          * @returns {undefined} It doesn't return
//                          */
//                         const _addPort = function (portId) {
//                             let portData = portId.split('.');
//                             let portType = portData[1];
//                             let portIndex = portData[2];
//                             let portDirection = _getPortDirection(portId);
//
//                             let supportedSignals = ConnectorsFactory.ports[portType];
//                             let masterSignal = ConnectorsFactory.masterSignal[portType] ?
//                                 ConnectorsFactory.masterSignal[portType] : supportedSignals[0];
//
//
//                             let commands = [];
//
//                             for (let commandType in portsCommands) {
//                                 if (portsCommands[commandType][portDirection].hasOwnProperty(portType)) {
//                                     if (supportedSignals.length > 1) {
//                                         for (let i = 0; i < supportedSignals.length; i++) {
//                                             if (portsCommands[commandType][portDirection][portType][supportedSignals[i]])
//                                                 commands = commands.concat(portsCommands[commandType][portDirection][portType][supportedSignals[i]])
//                                         }
//                                     } else {
//                                         commands = commands.concat(portsCommands[commandType][portDirection][portType])
//                                     }
//                                 }
//                             }
//                             commands = [...new Set(commands)];
//
//
//                             let port = factory.createModule('Port', {
//                                 commands,
//                                 portId,
//                                 portType,
//                                 portIndex,
//                                 portDirection,
//                                 supportedSignals,
//                                 masterSignal
//                             });
//
//                             return port;
//                         }
//
//
//                     }
//                 }
//
//                 class K_Port extends K_Module {
//                     constructor(data) {
//
//                         //TODO - here we need to manipulate the data before sending to the K_Module
//                         super(data);
//                         let _self = this;
//                         _self.model.data = {
//                             portIndex: data.portIndex,
//                             portType: data.portType,
//                             direction: data.portDirection,
//                             id: data.portId,
//                             label: null,
//                             supportedSignals: data.supportedSignals,
//                             selectedPort: true,
//                             switchablePort: false,
//                             switchableGroupName: null,
//                             signal: false,
//                             masterSignal: data.masterSignal,
//                             followers: null,
//                             followerMode: {},
//                         }
//
//                         if (_self.model.data.supportedSignals.length > 1 && _self.model.data.direction === 'input') {
//                             _self.model.data.followers = {};
//                             for (let i = 0; i < _self.model.data.supportedSignals.length; i++) {
//                                 if (_self.model.data.supportedSignals[i] !== _self.model.data.masterSignal) {
//                                     _self.model.data.followers[_self.model.data.supportedSignals[i]] = {
//                                         list: [], //id, label
//                                         selected: null
//                                     }
//                                 }
//                             }
//                         }
//                         if (_self.model.data.portType.indexOf('USB') > -1)
//                             _self.model.data.name = data.portType.replace('_', ' Type- ') + data.portIndex;
//                         else
//                             _self.model.data.name = data.portType.replace('_', ' ') + ' ' + data.portIndex;
//                     }
//                 }
//
//                 let _modules = {
//                     "MATRIX": K_Matrix,
//                     "PORT": K_Port
//                 };
//
//
//                 factory.createModule = _createModule;
//                 return factory;
//
//
//                 function _createModule(module, data) {
//                     let moduleToInstanciate = module.toUpperCase();
//                     let moduleCreated = null;
//                     switch (moduleToInstanciate) {
//                         case 'MATRIX':
//                         case 'PORT':
//                             moduleCreated = new _modules[moduleToInstanciate](data);
//                             break;
//                         default:
//                             moduleCreated = new K_Module(data);
//                     }
//                     moduleCreated.buildCommands();
//                     DataProxyService.register(moduleCreated);
//                     return moduleCreated;
//                 }
//
//
//
//
//             }
//
//         ])
//
//
// })(new Commands());
