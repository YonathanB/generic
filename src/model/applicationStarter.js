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
 * @requires K_DataProxy
 * @requires angular - angular is used in order to provide its Promises implementation
 */

//
import {deviceCommands} from "../core/data/Commands";
import K_DataProxy from "../core/data/DataProxy";


// needs to import angular for providers - TODO remove when refactoring to native
const $injector = require('angular').injector(['ng']);


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
    _$q;


/**
 * Class to access data
 * @name ApplicationStarter
 * @module DeviceModel
 * @kind class
 * @param {Object} $rootScope - The angular $rootScope in order to bind data to the view, or interact with view on app status has changed.
 * @param {Object} $http - angular implementation of Ajax.
 * @param {function} $q - angular implementation of Promises.
 * */


class DeviceViewModel {
    constructor(deviceActions) {
        // this.dataProxy = dataProxy;
        this.data = {};
        this.actions = deviceActions;
    }

    updateViewModel(updatedData, cmdField) {


        //notify view only if it's not an handshake
        // TODO - we can add a timeout to prevent digest loop every time on load
        if ($('body') && cmdField.cmd.key !== deviceCommands.HAND_SHAKE.key) {
            this.data = Object.assign(this.data, updatedData);
            setTimeout(function () {
                $('body').scope().$applyAsync()
            }, 0);
        }
    }
}



const deviceActions = {
    updateData: function(){
        console.log('updateData');
    },


    updateCredentials: function() {
        console.log('updateCredentials');
    },
    upgradeDevice: function(){
        console.log('upgradeDevice');
    },
    toggleSecurity: function(data){
        var toSend = deviceCommands.SECURITY_ENABLE;
        if(data && data.params) {
            toSend.params = [0];
            toSend.value = data.params.join(',');
        } else{
            toSend.value = 1;
            toSend.params = null;
        }
        return _DataProxy.put([toSend]);
    },
    factoryReset: function(){
        console.log('factoryReset');
    },
    restartDevice: function(){
        console.log('restartDevice');
    },
    updateMatrixRoute: function(){
        console.log('updateMatrixRoute');
    },
    loadConfig: function(){
        console.log('updateMatrixRoute');
    },
    saveConfig: function(){
        console.log('updateMatrixRoute');
    }

};



let _DeviceViewModel = new DeviceViewModel(deviceActions);

class ApplicationStarter {
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
            'connectionAttempts': 3,
            'handShakeCommand': deviceCommands.HAND_SHAKE,
            'sendOnCommunicationStart': [deviceCommands.MODEL, deviceCommands.NAME, deviceCommands.SECURITY_ENABLE]
        };// contains device definition
        this.STATUS = null;
        this.modules = {};

    }

    /**

     * @returns {Promise} - Promise when deviceModel is ready and synchronised to physical device
     * @function
     * @description That function start the DeviceModel by enabling connection to device
     */
    start() {

        // TODO -
        _self.STATUS = _APP_STATES.CONNECTING;
        let defer = _$q.defer();
        _$http.get('info')
            .then(function (deviceMetadata) {
                let tmpInfoFile = deviceMetadata.data;
                tmpInfoFile.communication = Object.assign(_self.infoFile.communication, tmpInfoFile.communication);

                _DataProxy = new K_DataProxy(_$q, tmpInfoFile.communication, {
                    'onConnectionLost': _onConnectionLost,
                    'onDataUpdated': _DeviceViewModel.updateViewModel.bind(_DeviceViewModel)
                });


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

    getViewModel() {
        return _DeviceViewModel;
    }

    initModule(module) {
        return _DataProxy.get(_self.modules[module].commands)
            .then(function (data) {
                _self.modules[module].ready = true;
                return data;
            })
    }


}

export const applicationStarter = new ApplicationStarter(
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
    let modules = _self.infoFile.modules;
    for (var _mod in modules) {
        _self.modules[_mod] = {
            'ready': false,
            'commands': _buildModuleCommands(modules[_mod].commands)
        }
    }
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


