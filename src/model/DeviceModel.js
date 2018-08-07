/***********************************************
 * File Name: DeviceModel
 * Created by: Yonathan Benitah
 * On: 03/05/2017  15:32
 * Last Modified: 02/08/2018
 * Modified by: ybenitah
 ***********************************************/
/**
 * @fileOverview The DeviceModel define the web device model.
 * The module returns an instantiated object (not a class)
 * @module core/model
 * @requires deviceCommands
 * @requires K_Dataproxy
 * @requires angular - angular is used in order to provide its Promises implementation
 */


import {deviceCommands} from "../core/data/Commands";
import K_Dataproxy from "../core/data/DataProxy";


// needs to import angular for providers - TODO remove when refactoring to native
import angular from 'angular';

const $injector = angular.injector(['ng']);


/**
 * @property {Enum} _APP_STATES - Defines constants for different device's web status
 *
 */
const _APP_STATES = Object.freeze({
    CONNECTING: Symbol("CONNECTING"),
    RUNNING: Symbol("RUNNING"),
    RESTARTING: Symbol("RESTARTING"),
    UPGRADING: Symbol("UPGRADING"),
    CONNECTION_LOST: Symbol("CONNECTION_LOST"),
    CONNECTION_FAILED: Symbol("CONNECTION_FAILED")
});

let _self;

/**
 * @property {Object} _Commands - Device's command are stores in a private variable
 */
let _Commands = deviceCommands;

/**
 * @property {Object} _DataProxy - Access to data through the DataProxy object
 */
let _DataProxy;
let _$rootScope,
    _$http,
    _$q,
    _heartBeatInterval,
    _missedHeartBeats;


/**
 * Class to access data
 * @name DeviceModel
 * @module DeviceModel
 * @kind class
 * @param {Object} $rootScope - The angular $rootScope in order to bind data to the view, or interact with view on app status has changed.
 * @param {Object} $http - angular implementation of Ajax.
 * @param {function} $q - angular implementation of Promises.
 * */
class DeviceModel {
    constructor($rootScope, $http, $q) {
        _$rootScope = $rootScope;
        _$http = $http;
        _$q = $q;
        _self = this;
        this.infoFile = {};
        this.infoFile.communication = {
            'type': 'ws',
            'protocol': 'kramer-p3k-protocol',
            'url': location.hostname,
            'translator': 'p3k',
            'timeout': 0,
            'connectionAttempts': 3
        };// contains device definition
        this.STATUS = null;
        this.modules = {};
        this.data = {};

    }

    /**

     * @returns {Promise} - Promise when deviceModel is ready and synchronised to physical device
     * @function
     * @description That function start the DeviceModel by enabling connection to device
     */
    start() {

        // TODO - _self.STATUS = _APP_STATES.CONNECTING;
        let defer = _$q.defer();
        _$http.get('info')
            .then(function (deviceMetadata) {
                let tmpInfoFile = deviceMetadata.data;
                tmpInfoFile.communication = Object.assign(_self.infoFile.communication, tmpInfoFile.communication);

                _DataProxy = new K_Dataproxy(_$q, tmpInfoFile.communication, _onConnectionLost);


                _self.infoFile = tmpInfoFile;
                _createModules.call(_self);
                _self.STATUS = _APP_STATES.CONNECTING;
                _connectToDevice.call(_self)
                    .then(function (res) {
                        defer.resolve(_self.infoFile);
                    })
                    .catch(function (a) {
                        console.log(a);
                    })
                    .finally(function (a) {
                        console.log(a);
                    });
            })
            .catch(function (err) {
                console.log("TODO - NO INFO FILE!!!!!!!!! TODO ", err)
            });
        return defer.promise;
    }

    getData() {
        return _DataProxy.getData();
    }

    initModule(module) {
        return _DataProxy.get(_self.modules[module].commands)
            .then(function (data) {
                _self.modules[module].ready = true;
                return data;
            })
    }


}

export const deviceModel = new DeviceModel(
    $injector.get('$rootScope'),
    $injector.get('$http'),
    $injector.get('$q')
);


function _buildModuleCommands(commands) {
    let _commands = null;
    if (commands && commands.length > 0) {
        _commands = [];
        let _cmd;
        for (let i = 0; i < commands.length; i++) {
            if (typeof commands[i] === "string") {
                _cmd = commands[i].split(' ');
                _commands[i] = Object.assign({}, _Commands.commandsByOpCode[_cmd[0]]);
            }

            // command with params
            if (_cmd[1])
                _commands[i].parserOnSend(_cmd[1]);
        }
    }
    return _commands;
}

function _createModules() {
    let _self = this;
    _setUpInitModule.call(_self);
    _setUpGlobalModule();
    let modules = _self.infoFile.modules;
    for (var _mod in modules) {
        _self.modules[_mod] = {
            'ready': false,
            'commands': _buildModuleCommands(modules[_mod].commands)
        }
    }
}

function _setUpInitModule() {
    // TODO
    // this.modules['INIT'] = K_ModuleFactory.createModule('INIT', {"commands": _infoFile["communication"].onInit});
}

function _setUpGlobalModule() {
    console.log("TODO - implement the global module, it will define all the command with particular callbacks: factory|reset|dhcp|IP|PASSWORD ...")
    console.log("Need to be instantiate on main state")
}

function _connectToDevice() {
    return _DataProxy.start()
        .then(function (data) {
            if ([_APP_STATES.CONNECTION_LOST, _APP_STATES.RESTARTING].indexOf(_self.STATUS) > -1)
                location.reload();
            _self.STATUS = _APP_STATES.RUNNING;
            // _startHeartBeat.call(_self);
        })
        .catch(function (err) {
            _onConnectionLost.call(_self, "CONNECTION_FAILED");
        })
}


function _onConnectionLost(detail) {
    let _self = this;
    if (_self.STATUS !== _APP_STATES.RESTARTING) {
        if (detail) {
            _$rootScope.$emit("CONNECTION_FAILED");
            _self.STATUS = _APP_STATES.CONNECTION_FAILED;
        } else {
            _$rootScope.$emit("CONNECTION_LOST");
            _self.STATUS = _APP_STATES.CONNECTION_LOST;
        }
    }
    _connectToDevice.call(_self);
}


// (function () {
//     angular.module('model')
//         .service('DeviceModel', [
//             'DataProxy',
//             'K_ModuleFactory',
//             'Commands',
//             '$_APP_STATES',
//             '$rootScope',
//             '$http',
//             '$q',
//             function (DataProxy, K_ModuleFactory, Commands, $_APP_STATES, $rootScope, $http, $q) {
//                 var deviceModel = this;
//                 var _infoFile; // will contain the device descriptor from info file on device
//
//                 // TODO - may be we will set authentication to the global module
//                 deviceModel.modules = {
//                     "GLOBAL": {} // it's a global module for all applications
//                 }; // this object will contains our module
//
//
//                 var _heartBeatInterval, _missedHeartBeats;
//                 // TODO all the logic for the matrix should be set to K_Matrix
//                 // var INIT_ROUTES = false;
//                 // var refreshingMatrixPendingRequest = null;
//                 // var timeOutForCallingServer_1 = Date.now();
//                 // var newMatrixStatus = function () {
//                 //     var matrix = this;
//                 //     refreshingMatrixPendingRequest = $timeout(function () {
//                 //         return matrix.init(true).then(function () {
//                 //             refreshingMatrixPendingRequest = null;
//                 //             INIT_ROUTES = false;
//                 //         })
//                 //     }, 300);
//                 // };
//
//
//                 function onLostConnection(detail) {
//                     if (deviceModel.STATUS !== $_APP_STATES.RESTARTING) {
//                         if (detail) {
//                             $rootScope.$emit("CONNECTION_FAILED");
//                             deviceModel.STATUS = $_APP_STATES.CONNECTION_FAILED;
//                         } else {
//                             $rootScope.$emit("CONNECTION_LOST");
//                             deviceModel.STATUS = $_APP_STATES.CONNECTION_LOST;
//                         }
//                     }
//                     _connectToDevice();
//                 }
//
//                 deviceModel.start = function () {
//                     var defer = $q.defer();
//                     $http.get('info')
//                         .then(function (deviceMetadata) {
//                             _infoFile = deviceMetadata.data;
//                             _createModules();
//                             deviceModel.STATUS = $_APP_STATES.CONNECTING;
//                             _connectToDevice()
//                                 .then(function (res) {
//                                     defer.resolve(_infoFile);
//                                 })
//                                 .catch(function (a) {
//                                     console.log(a);
//                                 })
//                                 .finally(function (a) {
//                                     console.log(a);
//                                 });
//                         })
//                         .catch(function (err) {
//                             console.log("TODO - NO INFO FILE!!!!!!!!! TODO ", err)
//                             //     $exceptionHandler('No configuration file', {
//                             //         message: 'The info file is missing, please contact your administrator\n',
//                             //         code: "error"
//                             //     });
//                             //     defer.resolve({
//                             //         "views": {
//                             //             "about": {
//                             //                 "id": "about",
//                             //                 "name": "about",
//                             //                 "controller": "aboutCtrl",
//                             //                 "url": "about",
//                             //                 "template": "about.html",
//                             //                 "description": "About",
//                             //                 "icon": "icon-info"
//                             //             }
//                             //         }
//                             //     });
//                         });
//                     return defer.promise;
//                 };
//
//
//                 function _setUpInitModule() {
//                     deviceModel.modules['INIT'] = K_ModuleFactory.createModule('INIT', {"commands": _infoFile["communication"].onInit});
//                 }
//
//                 function _setUpGlobalModule() {
//                     console.log("TODO - implement the global module, it will define all the command with particular callbacks: factory|reset|dhcp|IP|PASSWORD ...")
//                     console.log("Need to be instantiate on main state")
//                 }
//
//
//
//
//                 function _startHeartBeat() {
//                     if (!_heartBeatInterval) {
//                         _missedHeartBeats = 0;
//                         _heartBeatInterval = setInterval(function () {
//                             if (_missedHeartBeats)
//                                 onLostConnection();
//                             _missedHeartBeats++;
//                             DataProxy.get([Commands.HAND_SHAKE])
//                                 .then(function (data) {
//                                     _missedHeartBeats = 0;
//                                 })
//                         }, 30000);
//                     }
//                 }
//
//                 function _connectToDevice() {
//                     return DataProxy.init(_infoFile["communication"], onLostConnection)
//                         .then(function (data) {
//                             if ([$_APP_STATES.CONNECTION_LOST, $_APP_STATES.RESTARTING].indexOf(deviceModel.STATUS) > -1)
//                                 location.reload();
//                             deviceModel.STATUS = $_APP_STATES.RUNNING;
//                             _startHeartBeat();
//                         })
//                         .catch(function (err) {
//                             onLostConnection("CONNECTION_FAILED");
//                         })
//                 }
//
//
//                 // global handlers
//                 // deviceModel.onRestart = {
//                 //     refresh: function () {
//                 //         $rootScope.launchGlobalMessage("Your device is restarting", 60);
//                 //         $timeout(reconnectionProcess, 40000);
//                 //     }
//                 // };
//                 // deviceModel.onFactory = {
//                 //     refresh: function () {
//                 //         $rootScope.launchGlobalMessage("Your device is processing a factory reset!", 60);
//                 //         $timeout(function () {
//                 //             window.location.href = "http://192.168.1.39";
//                 //         }, 60000);
//                 //     }
//                 // };
//                 // deviceModel.onSecurityChange = {
//                 //     refresh: function (data) {
//                 //         if (!deviceIsSwitchingSecurityToTrue && Authentication.get() == 0 && data.value == 1) {
//                 //             $exceptionHandler('Security Enable', {
//                 //                 message: 'Security has been enable by third part user\n' +
//                 //                 'By click on \'OK\' Web page will refresh and you may be asked for credentials.\n',
//                 //                 code: "alert",
//                 //                 type: 'alert',
//                 //                 onClose: function () {
//                 //                     location.reload();
//                 //                 }
//                 //             });
//                 //         }
//                 //         Authentication.set(data.value);
//                 //     }
//                 // };
//                 // deviceModel.onDHCP_Changed = {
//                 //     refresh: function (data) {
//                 //         if (data.value == 1 && DHCP_status === false) {
//                 //             $rootScope.launchGlobalMessage('DHCP is now enabled.\n' +
//                 //                 'To continue, please enter the DHCP assigned IP address in your browser.\n');
//                 //             if (angular.isDefined(deviceModel.onDHCP_ON)) {
//                 //                 deviceModel.onDHCP_ON();
//                 //             }
//                 //             DHCP_status = true;
//                 //         }
//                 //         else {
//                 //             if (data.value == 1)
//                 //                 DHCP_status = true;
//                 //             if (data.value == 0)
//                 //                 DHCP_status = false;
//                 //             if (angular.isDefined(deviceModel.onDHCP_OFF)) {
//                 //                 deviceModel.onDHCP_OFF();
//                 //             }
//                 //         }
//                 //     }
//                 // };
//                 // deviceModel.onIP_Changed = {
//                 //     refresh: function (data) {
//                 //         if (location.host != data.value && location.host.indexOf("localhost") === -1)
//                 //             redirectToIP(data.value);
//                 //     }
//                 // };
//                 // deviceModel.onTCP_Changed = {
//                 //     refresh: function (data) {
//                 //         if (initCommunicationData.reopenSocketOnTCP) {
//                 //             var deferred = $q.defer();
//                 //             _openCommunication(deferred);
//                 //             return deferred.promise;
//                 //         }
//                 //
//                 //
//                 //     }
//                 // };
//
//
//                 // Global functions
//                 // deviceModel.updateTCP = function (value) {
//                 //     Commands.ETH_PORT.TCP.value = value;
//                 //     deviceModel.put([Commands.ETH_PORT.TCP]).then(function () {
//                 //
//                 //     })
//                 //     $timeout(deviceModel.onTCP_Changed.refresh, 500);
//                 // };
//                 deviceModel.enableDHCP = function () {
//                     deviceIsSwitchingDHCPToTrue = true;
//                     deviceModel.put({
//                         command: Commands.NET_DHCP,
//                         value: '1'
//                     })
//                 };
//                 deviceModel.setIP = function (newIP) {
//                     deviceModel.put({
//                         command: Commands.NET_IP,
//                         value: newIP
//                     }).then(function (data) {
//                         if (angular.isUndefined(data.errCode))
//                             deviceModel.onIP_Changed.refresh(data);
//
//                         else {
//                             $exceptionHandler('Update Failed', {
//                                 message: 'For unknown cause, device failed to update its IP\n',
//                                 code: "error"
//                             });
//                         }
//                     }, function (err) {
//                         $exceptionHandler('Update Failed', {
//                             message: 'For unknown cause, device failed to update its IP\n',
//                             code: "error"
//                         });
//                     });
//                 };
//                 deviceModel.updateNetworkData = function (networkData) {
//                     return deviceModel.put({
//                         command: Commands.NET_CONFIG,
//                         value: networkData.NET_IP + ',' + networkData.NET_MASK + ',' + networkData.NET_GATE
//                     }).then(function (data) {
//                         console.log(data);
//                     });
//                 };
//
//                 deviceModel.FactoryReset = function () {
//                     $rootScope.launchGlobalMessage("Your device is processing a factory reset!", 60);
//                     deviceModel.put({
//                         command: Commands.FACTORY_RESET,
//                         value: ''
//                     }).then(function (data) {
//                         deviceModel.put({
//                             command: Commands.RESTART,
//                             value: ''
//                         })
//                     });
//                 };
//                 deviceModel.restart = function () {
//                     deviceModel.STATUS = $_APP_STATES.RESTARTING;
//                     $rootScope.launchGlobalMessage("Your device is restarting!", 60);
//                     deviceModel.put([Commands.RESTART])
//                 };
//                 // deviceModel.updateSecurityPassword = function (newPassword, currentPassword) {
//                 //     newPassword = newPassword.trim();
//                 //
//                 //     if (newPassword.length < 5 || newPassword.indexOf(' ') > -1 || newPassword.length > 15) {
//                 //         $exceptionHandler('Fail to update password', {
//                 //             message: 'The password is limited to max of 15 alphanumeric characters and spaces are not allowed.\n',
//                 //             code: "1001",
//                 //             type: 'error'
//                 //         });
//                 //         return;
//                 //     }
//                 //     deviceModel.put({
//                 //         command: Commands.PASSWORD,
//                 //         value: currentPassword + ',' + newPassword
//                 //     }).then(function (data) {
//                 //         if (angular.isDefined(data.errCode))
//                 //             $exceptionHandler('Fail to update password', {
//                 //                 message: 'Password hasn\'t been  updated\n' +
//                 //                 'Maybe due to a wrong current password.\n',
//                 //                 code: "1001",
//                 //                 type: 'error'
//                 //             });
//                 //         else
//                 //             $exceptionHandler('Password Updated', {
//                 //                 message: 'Password has been successfully updated\n',
//                 //                 type: 'success',
//                 //                 code: "10"
//                 //             });
//                 //     });
//                 // };
//                 // // deviceModel.disableSecurity = function (password) {
//                 //     var defered = $q.defer();
//                 //     deviceModel.put({
//                 //         command: Commands.SECURITY_ENABLE,
//                 //         value: '0, ' + password
//                 //     }).then(function (data) {
//                 //         if (angular.isUndefined(data.errCode)) {
//                 //             Authentication.set(data.value);
//                 //             defered.resolve();
//                 //         }
//                 //         else defered.reject();
//                 //     }, function (err) {
//                 //         if (angular.isDefined(err.type))
//                 //             defered.reject();
//                 //     });
//                 //     return defered.promise;
//                 // };
//                 // deviceModel.enableSecurity = function () {
//                 //     var defered = $q.defer();
//                 //     deviceIsSwitchingSecurityToTrue = true;
//                 //     deviceModel.put({
//                 //         command: Commands.SECURITY_ENABLE,
//                 //         value: '1'
//                 //     })
//                 //         .then(function (data) {
//                 //             if (angular.isUndefined(data.errCode)) {
//                 //                 // Authentication.set(data.value);
//                 //                 defered.resolve();
//                 //             }
//                 //             else defered.reject();
//                 //         })
//                 //         .catch(function (err) {
//                 //             if (angular.isDefined(err.type))
//                 //                 defered.reject();
//                 //         });
//                 //     return defered.promise;
//                 // };
//
//                 // Global commands to register
//                 DataProxy.moduleRegister(deviceModel.onRestart, Commands.RESTART);
//                 DataProxy.moduleRegister(deviceModel.onIP_Changed, Commands.NET_IP);
//                 DataProxy.moduleRegister(deviceModel.onSecurityChange, Commands.SECURITY_ENABLE);
//                 DataProxy.moduleRegister(deviceModel.onFactory, Commands.FACTORY_RESET);
//                 DataProxy.moduleRegister(deviceModel.onDHCP_Changed, Commands.NET_DHCP);
//
//
//                 return deviceModel;
//             }])
// })();
//

// initCommunicationData.type = onInitData.type || 'ws'; // http or ws
// initCommunicationData.url = angular.isDefined(onInitData.url) ? onInitData.url : location.host; // if undefined, will set the location.host
// initCommunicationData.timeout = onInitData.timeout || 0; // time to wait between each transaction
// initCommunicationData.connectionAttempts = onInitData.connectionAttempts || 0; // (optional) This parameter is used when websocket is close
// initCommunicationData.protocol = onInitData.protocol || undefined;//'kramer-p3k-protocol'; // for some webSocket we need to defined here the protocol
// initCommunicationData.useHeartBeat = angular.isDefined(onInitData.useHeartBeat) ? onInitData.useHeartBeat : false;
// initCommunicationData.onHeartBeat = onInitData.onHeartBeat || [Commands.MODEL];
// initCommunicationData.onInit = angular.isDefined(onInitData.onInit) ? [Commands.NET_IP, Commands.MODEL, Commands.NAME].concat(onInitData.onInit) : [Commands.NET_IP, Commands.MODEL, Commands.NAME]; // Data to call on transaction start
// initCommunicationData.translator = onInitData.translator || 'p3k'; // some devices need a json envelope to work: {p3k: /* your p3k command here */ }
// initCommunicationData.reopenSocketOnTCP = angular.isDefined(onInitData.reopenSocketOnTCP) ? onInitData.reopenSocketOnTCP : false; // some devices need a to reopen socket on tcp changed (firmware bug)
//
// var _initDeviceData = function (data) {
//     var deferred = $q.defer();
//     for (var d in data) {
//         switch (data[d].cmd.key) {
//             case Commands.SECURITY_ENABLE.key:
//                 Authentication.set(data[d].value);
//                 break;
//             case Commands.MODEL.key:
//                 $rootScope.model = data[d].value;
//                 break;
//         }
//     }
//
//     // if (!_infoFile) {
//     //     var deviceFactoryDefinition = $rootScope.model.replace('-', '_').toUpperCase() + '_Factory';
//     //     try {
//     //         _infoFile = $injector.get(deviceFactoryDefinition);
//     //     } catch (e) {
//     //         _infoFile = $injector.get('DefaultModelFactory');
//     //     }
//     // }
//
//
//     for (var module in _infoFile.modules) {
//         deviceModel[module] = _infoFile.modules[module];
//         var moduleCommand = {};
//         var commands, retryAttemptsOnFailed, onlyGetCommands;
//
//         commands = _infoFile.modules[module].commands;
//         if (_infoFile.modules[module].hasOwnProperty('onlyGetCommands'))
//             onlyGetCommands = _infoFile.modules[module].onlyGetCommands;
//         if (_infoFile.modules[module].hasOwnProperty('onlyGetCommands'))
//             retryAttemptsOnFailed = _infoFile.modules[module].retryAttemptsOnFailed;
//
//         if (commands) {
//             var splitted
//             for (var i = 0; i < commands.length; i++) {
//                 if (typeof commands[i] == "string") {
//                     splitted = commands[i].split(' ');
//                     commands[i] = Commands.commandsByOpCode[splitted[0]]
//                 }
//                 if (commands[i].parent)
//                     moduleCommand[commands[i].parent.key + '_' + splitted[1]] = Commands.commandsByOpCode[commands[i].opCode][splitted[1]];
//
//                 else if (splitted[1])
//                     moduleCommand[commands[i].key + '_' + splitted[1]] = Commands.commandsByOpCode[commands[i].opCode][splitted[1]];
//
//                 else
//                     moduleCommand[commands[i].key] = Commands.commandsByOpCode[commands[i].opCode];
//             }
//             deviceModel[module] = new K_Module(moduleCommand, onlyGetCommands, retryAttemptsOnFailed)
//         }
//         else
//             deviceModel[module] = {};
//
//         switch (module) {
//             case DeviceModuleFactory.modules.POE:
//                 deviceModel.POE.updateUI = function(data) {
//                     if (deviceModel.POE.initialized) {
//                         switch(data.cmd){
//                             case Commands.X_POE.key:
//                                 var poeGroup;
//                                 for (var poeLine in deviceModel.POE.data.X_POE_GROUPS) {
//                                     if (deviceModel.POE.data.X_POE_GROUPS[poeLine].inputs.indexOf(data.param) > -1
//                                         || deviceModel.POE.data.X_POE_GROUPS[poeLine].outputs.indexOf(data.param) > -1) {
//                                         poeGroup = poeLine;
//                                         break;
//                                     }
//                                 }
//                                 deviceModel.POE.data.X_POE_GROUPS[poeGroup].selected[0] = data.param;
//                                 break;
//                             case Commands.GLOBAL_POE.key:
//                                 deviceModel.POE.data.GLOBAL_POE = data.value;
//                                 break;
//                         }
//
//                     }
//                 };
//                 deviceModel.POE.registerCommand(Commands.X_POE, deviceModel.POE.updateUI);
//
//                 deviceModel.POE.registerCommand(Commands.X_POE, deviceModel.POE.updateUI);
//                 break;
//             case DeviceModuleFactory.modules.matrix:
//                 var K_Port = $injector.get('K_Port');
//                 deviceModel.portsList = angular.extend(new K_Module({
//                     "portsList": Commands.PORTS_LIST,
//                     "selectedPort": Commands.X_PORT_SELECT_LIST
//                 }), K_Port);
//                 deviceModel.portsList.registerCommand(Commands.X_PORT_SELECT, deviceModel.portsList.updateUI);
//                 deviceModel.portsList.registerCommand(Commands.X_POE, deviceModel.portsList.updateUI);
//                 deviceModel.portsList.registerCommand(Commands.X_POE_GROUPS, deviceModel.portsList.updateUI);
//
//                 if (_infoFile.modules.matrix.hasOwnProperty('bothPortsDirection')) {
//                     deviceModel.portsList.setPortDirection(function (port) {
//                         var toInputsPort = _infoFile.modules.matrix.bothPortsDirection.input
//                         var toOutputsPort = _infoFile.modules.matrix.bothPortsDirection.output
//
//                         if (toInputsPort && toOutputsPort)
//                             if ((toInputsPort.indexOf(port) > -1 || port.indexOf('IN') > -1)
//                                 && toOutputsPort.indexOf(port) == -1)
//                                 return 'input';
//                             else
//                                 return 'output';
//                     });
//                 }
//                 else{
//                     deviceModel.portsList.setPortDirection(function (port) {
//                         if (port.indexOf('IN') > -1) return 'input';
//                         else    return 'output';
//                     })
//                 }
//
//                 if (_infoFile.modules.matrix.hasOwnProperty('setFollowersPort'))
//                     deviceModel.portsList.setFollowersPort(function (port) {
//                         return _infoFile.modules.matrix.setFollowersPort(port)
//                     })
//
//                 deviceModel.portsList.setPortsCommands(_infoFile.modules.matrix.overviewDataToLoad, _infoFile.modules.matrix.detailDataToLoad);
//                 deviceModel.matrix.onUpdate = function (newRoute) {
//                     if (!_infoFile.modules[DeviceModuleFactory.modules.matrix].hasOwnProperty('noRouting') ||
//                         angular.isUndefined(_infoFile.modules[DeviceModuleFactory.modules.matrix].noRouting[newRoute.input.id]) ||
//                         _infoFile.modules[DeviceModuleFactory.modules.matrix].noRouting[newRoute.input.id].indexOf(newRoute.output.id) === -1) {
//                         var commandToSend = {};
//                         commandToSend[Commands.X_SET_ROUTE.key] = Commands.X_SET_ROUTE;
//                         commandToSend[Commands.X_SET_ROUTE.key].value = newRoute.output.id + '.' + newRoute.signal +
//                             '.1,' + newRoute.input.id + '.' + newRoute.signal + '.1';
//                         return commandToSend;
//                     }
//                     else
//                         return false;
//                 };
//
//                 deviceModel.matrix.refresh = function (newRoute) {
//                     console.log(newRoute)
//                     if(newRoute.cmd.key !== Commands.MATRIX_STATUS.key) {
//                         if (angular.isUndefined(newRoute[0]) || angular.isUndefined(newRoute[0].errCode)) {
//                             var parsedRoute = {};
//                             var initRoute = false;
//                             if (angular.isArray(newRoute) && newRoute[0].cmd.key !== Commands.MATRIX_STATUS.key)
//                                 Commands.X_SET_ROUTE.parserOnMessage(newRoute[0].value, parsedRoute);
//                             else if (newRoute.cmd.key !== Commands.MATRIX_STATUS.key)
//                                 Commands.X_SET_ROUTE.parserOnMessage(newRoute.value, parsedRoute);
//                             else return;
//
//                             if (!INIT_ROUTES) {
//                                 for (var route in parsedRoute) {
//                                     if (angular.isUndefined(this.data.MATRIX_STATUS[route])) {
//                                         initRoute = true;
//                                         break;
//                                     }
//                                     for (var signal in parsedRoute[route]) {
//                                         if (angular.isUndefined(this.data.MATRIX_STATUS[signal])) {
//                                             initRoute = true;
//                                             break;
//                                         }
//                                         else if (this.data.routes[route][signal].indexOf(parsedRoute[route][signal][0]) === -1) {
//                                             initRoute = true;
//                                             break;
//                                         }
//                                     }
//                                     break;
//                                 }
//                                 INIT_ROUTES = initRoute;
//                             }
//                             if (INIT_ROUTES) {
//                                 var timeOutForCallingServer_2 = Date.now();
//                                 var difference = timeOutForCallingServer_2 - timeOutForCallingServer_1;
//                                 console.log('DIFFERENCE ', difference);
//                                 if (refreshingMatrixPendingRequest) {
//                                     $timeout.cancel(refreshingMatrixPendingRequest);
//                                     refreshingMatrixPendingRequest = null;
//                                 }
//                                 newMatrixStatus.call(this);
//
//                             }
//                         }
//                         else
//                             console.error('ERROR: ', newRoute[0]);
//                     }
//                 };
//                 deviceModel.matrix.noRouting = _infoFile.modules.matrix.noRouting
//
//                 deviceModel.portsList.init()
//                     .then(function (MatrixPorts) {
//
//                         // ADD PORT to deviceModel.portsList  **TODO - check if better to add into K_Port
//                         for (var port in MatrixPorts.data.portsList) {
//                             var portData = MatrixPorts.data.portsList[port].split('.');
//                             // port: port's name returned by device
//                             //portData[1]: port's Type (i.e HDMI, HDBT ...)
//                             // portData[2]:  port's index
//                             deviceModel.portsList.addPort(MatrixPorts.data.portsList[port], portData[1], portData[2]);
//                             if (portData[1] == 'RS232')
//                                 deviceModel.portsList.addPort(MatrixPorts.data.portsList[port], portData[1], portData[2], 'input');
//
//                         }
//
//                         // Set selected ports for switchable ports (input)
//                         ConnectorsFactory.switchablePorts = MatrixPorts.data.selectedPort;
//                         if (typeof  MatrixPorts.data.selectedPort === "object") {
//                             for (var port in MatrixPorts.data.selectedPort) {
//                                 var selectedPort = MatrixPorts.data.selectedPort[port].selected;
//
//                                 for (var i = 0; i < MatrixPorts.data.selectedPort[port].group.length; i++) {
//                                     for (var j = 0; j < MatrixPorts.data.selectedPort[port].group[i].length; j++) {
//                                         deviceModel.portsList.getMatrixPorts().input[MatrixPorts.data.selectedPort[port].group[i][j]].selectedPort = false;
//                                         deviceModel.portsList.getMatrixPorts().input[MatrixPorts.data.selectedPort[port].group[i][j]].switchablePort = port;
//
//                                     }
//                                 }
//
//                                 for (var j = 0; j < MatrixPorts.data.selectedPort[port].group[selectedPort].length; j++) {
//                                     deviceModel.portsList.getMatrixPorts().input[MatrixPorts.data.selectedPort[port].group[selectedPort][j]].selectedPort = true;
//                                 }
//                             }
//                         }
//
//                         //set followers - TODO: check if we should move it to kMatrix.js
//                         for (var port in K_Port.getPortsList()) {
//                             if (K_Port.getPortsList()[port].followers) { // && K_Port.getPortsList()[port].selectedPort
//                                 for (var signal in K_Port.getPortsList()[port].followers) {
//                                     var portsContainsSignal = K_Port.getPortByMasterSignal(signal);
//                                     angular.forEach(portsContainsSignal, function (currentPort) {
//                                         if (currentPort.direction == K_Port.getPortsList()[port].direction) {
//                                             K_Port.getPortsList()[port].followers[signal].list.push(currentPort);
//                                         }
//                                     })
//                                 }
//                             }
//                         }
//                         deferred.resolve(_infoFile);
//                     })
//
//
//         }
//
//
//     }
//
//     if(_infoFile.hasOwnProperty('resolveOnLoaded')) {
//         for (var i = 0; i < _infoFile.resolveOnLoaded.length; i++) {
//             deviceModel[_infoFile.resolveOnLoaded[i]].init();
//         }
//     }
//
//     if (!_infoFile.modules.hasOwnProperty(DeviceModuleFactory.modules.matrix))
//         deferred.resolve(_infoFile); // if it contains the matrix module, resolve go from there
//     return deferred.promise;
//
//
// };


// (function () {
//     angular.module('model')
//     // 'Matrix',
//     // 'K_ModuleFactory',
//     // '$rootScope',
//     // '$exceptionHandler',
//     // 'Authentication',
//     // '$injector',
//     // 'DeviceModuleFactory',
//     // 'ConnectorsFactory',
//     // '$http',
//     // , Commands, $rootScope, K_Proxy, Commands, $timeout, $exceptionHandler, Authentication, $q, $injector, DeviceModuleFactory, ConnectorsFactory, $http) {
//
//         .service('DeviceModel', [
//             '$q',
//             '$timeout',
//             'DataProxy',
//             'Commands',
//             'K_ModuleFactory',
//             function ($q, $timeout, DataProxy, Commands, K_ModuleFactory) {
//                 var DeviceModel = {
//                     modules: {},
//                     onMsgRegister: {}
//                 };
//                 var _infoFile = null;
//
//                 var callBackOnChange = function (data) {
//                     var deferred = $q.defer();
//                     $timeout(function () {
//                         console.log("coucou --- ", data)
//                         deferred.resolve(data);
//                     }, 3000);
//                     return deferred.promise
//                 }
//
//
//                 // move to Commands
//                 var _buildCommands = function (CommandsOpCodeArr) {
//                     var toReturn = [];
//                     for (var i = 0; i < CommandsOpCodeArr.length; i++) {
//                         toReturn.push(Commands.commandsByOpCode[CommandsOpCodeArr[i]]);
//                     }
//                     return toReturn;
//                 };
//
//                 // at the moment info supply commands by opCode
//                 // TODO - need to change it to Commands key
//                 var _registerModuleToCommands = function (moduleToRegister) {
//                     if (moduleToRegister.commands) {
//                         for (var i = 0; i < moduleToRegister.commands.length; i++) {
//                             var command = angular.copy(moduleToRegister.commands[i].key);
//
//                             if (angular.isUndefined(DeviceModel.onMsgRegister[command]))
//                                 DeviceModel.onMsgRegister[command] = [];
//
//                             // prevent registering same module to command twice
//                             if (DeviceModel.onMsgRegister[command].indexOf(moduleToRegister) === -1)
//                                 DeviceModel.onMsgRegister[command].push(moduleToRegister)
//                         }
//                     }
//                 };
//
//                 var _createModules = function (modules) {
//                     for (var _mod in modules) {
//                         DeviceModel.modules[_mod] = K_ModuleFactory.createModule(_mod, modules[_mod]);
//                     }
//                     console.log(DeviceModel.modules)
//                 };
//
//                 var _releasePromise = function (msgFromDevice, promises) {
//
//                     if (promises.hasOwnProperty(msgFromDevice.cmd.key)
//                         && promises[msgFromDevice.cmd.key].length > 0) {
//
//                         promises[msgFromDevice.cmd.key][0].cb.resolve({
//                             commandKey: msgFromDevice.cmd.key,
//                             value: msgFromDevice.value
//                         });
//
//                         promises[msgFromDevice.cmd.key].shift();
//                     }
//                 };
//
//
//                 var _notifyModule = function (msgFromDevice) {
//                     if (DeviceModel.onMsgRegister[msgFromDevice.cmd.key]) {
//                         DeviceModel.onMsgRegister[msgFromDevice.cmd.key]
//                             .forEach(function (moduleToNotify) {
//                                 moduleToNotify.updateModel({
//                                     commandKey: msgFromDevice.cmd.key,
//                                     value: msgFromDevice.value
//                                 });
//                             })
//                     }
//                 };
//
//                 var _onMessageFromDevice = function (msgFromDevice, promises) {
//                     console.log('Message from device ', msgFromDevice)
//                     _releasePromise(msgFromDevice, promises);
//                     // _notifyModule(msgFromDevice);
//                 };
//
//
//                 DeviceModel.initModule = function (module) {
//                     return DeviceModel.modules[module].init();
//                 };
//
//
//                 DeviceModel.onUpdate = function (msg) {
//                     console.log(msg)
//                 };
//
//
//                 DeviceModel.start = function (infoFile) {
//                     _infoFile = infoFile;
//                     _createModules(infoFile["modules"]);
//
//                     let communicationSetup = infoFile["communication"];
//                     communicationSetup.onInit = _buildCommands(infoFile["communication"].onInit);
//
//                     return DataProxy.start(communicationSetup, _onMessageFromDevice)
//                         .then(function (data) {
//                             console.log(data)
//                         }, function (err) {
//                             console.log(err)
//                         })
//                 };
//                 return DeviceModel;
//             }]);
// })();