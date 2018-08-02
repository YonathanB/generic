/**
 * @license Web department
 * (c) Kramer Electronics LTD
 * License: Proprietary
 */

import K_WebSocket from '../communication/WebSocket';
import {deviceCommands} from "../data/Commands";
import {K_Parser} from "../parsers/ParserFactory";

/**
 * @memberof core
 * @ngdoc es6-module
 * @name data.DataProxy
 * @module data
 * @kind class
 *
 * @description
 *   The K_DataProxy implement access to device's data.
 *   It provides API for:
 *   - PUT (update data on device)
 *   - GET (read data from device/or backup)
 *   - start (start communication to device)
 *   Each time change will be detect on device it will notify the model
 *   The K_DataProxy, regulate call to device and check if communication to device still alive (when no data is beeing transfered)
 *
 * @param {Object=} K_WebSocket - Websocket implementation if device communication through websocket
 * On K_WebSocket instantiation following parameters may be supply
 * * `url`  **{String}** - The URL to open the websocket
 *
 * * `protocol`  **{string}** - WebSocket Protocol if there's any
 *
 * @param {Object=} deviceCommands - Object that contains all the device's commands
 *
 * @param {Object=} K_Parser - K_parser is a class that  won't be instantiated, because
 * all its functions are static. 2 functions are used in K_DataProxy
 *
 * `encode` - Encoding the message on send
 *
 * `decode` - Decoding message when device is notifying the web
 *
 *
 * @property {Object} _PROMISES_CALLBACKS - Contains all the callback to notify the vue when an update on device
 * Has been done
 *
 * @property {Object} _COMMUNICATION_OBJECT - Contains instance of active communication.
 *
 * `websocket` - In case of communication to device is websocket
 *
 * `polling` - In case of polling
 *
 * @property {Object} _STACK - data to be send
 *
 * @property {Object} _TIMEOUT - when true, data cannot be send right now so it will be added to the _STACK
 *
 *
 * @property {Object} _COM_PROPERTIES - contains communication definition
 *
 * `type` -  **http** for polling or **ws** for websocket
 * `url` - Device IP Default: location.host (IP on browser)
 * `protocol` - relevant only for websocket communication  - default to kramer-p3k-protocol
 * `timeout`-  time to wait between each transaction. As said, the K_DataProxy regulate transaction to device  - Default to 0
 * `connectionAttempts` - When websocket closed will try to reopen it without notifying user of lost communication
 * `translator`: relevant only for websocket. By default every message is wrap as follow **{'p3k': theP3Kcommand}**
 *
 *
 */

/**
 * @methodOf data.DataProxy
 * @param commands - Commands as array or object
 * @param idx - Optional.
 * @returns {*}
 * @description  Promise that will be resolved when device return all the data
 */


let _PROMISES_CALLBACKS = {
    // commandKey: {cmd, promise}
};

let _OBSERVERS = {};

let _COMMUNICATION_OBJECT = null;

let _STACK = [];

let _TIMEOUT = false;


let _COM_PROPERTIES;

let _heartBeatInterval, _missedHeartBeats;


let _self, _$q, _callbackOnConnectionLost;

export default class K_Dataproxy {
    constructor($q, comProp, callbackOnConnectionLost) {
        _self = this;
        _$q = $q;
        _COM_PROPERTIES = comProp;
        _callbackOnConnectionLost = callbackOnConnectionLost;
    }

    get(commands, idx) {
        _get(commands, idx)
    }

    put(commandToSend) {
        _put(commandToSend)
    }

    start() {
        return _init();
    }

}


/************************
 * GET DATA MANAGEMENT *
 * ********************/
function _get(commands, idx) {
    var deferred = _$q.defer();
    var dataToBeResolve = _createArrayOfCommands(commands);
    _commandsResolver(dataToBeResolve, deferred, idx);
    return deferred.promise;

}

function _createArrayOfCommands(commandsObj) {
    // TODO - In es6 we can use it: Object.values(dataToSend); - check compatibility with polyfill
    return (Object.keys(commandsObj).map(function (e) {
        if (_checkDataValidity(commandsObj[e]))
            return commandsObj[e]
    }).filter(function (element) {
        return element !== undefined;
    }));
}

function _checkDataValidity(dataToSend) {
    return (!dataToSend.isSetOnly);
}

function _commandsResolver(dataToSend, promise, idx) {
    if (!dataToSend || dataToSend.length === 0)
        return promise.resolve();
    // each time we send a bulk of command to device we reinitialise the timeout flag
    if (!_TIMEOUT) {
        _TIMEOUT = true;
        return _$q.all(_getData(dataToSend, idx))
            .then(function (data) {
                return promise.resolve(data);
            })
            .catch(function (error) {
                return promise.reject(error);
            })
            .finally(function (data) {
                return promise.resolve(data);
            });
    } else { // if _TIMEOUT is true we can send the commands so we keep it in a _STACK
        _STACK.push({dataToSend: dataToSend, promise: promise});
    }
}

function _getData(dataToGet, idx) {
    if (dataToGet.length > 0) {
        var promises = dataToGet.map(_createPromiseForCommand);

        if (_COM_PROPERTIES)
            (function myDelayedLoop(i) {
                setTimeout(function () {
                    _TIMEOUT = false;
                    _sendToDevice(dataToGet[i]);
                    if (dataToGet.length > ++i)
                        myDelayedLoop(i);
                }, _COM_PROPERTIES.timeout);
            })(0);

        return promises;
    }
}

function _createPromiseForCommand(command) {
    var deferred = _$q.defer();
    command.set = false;
    _registerPromiseForCallback(command, deferred);
    return deferred.promise;
}

function _sendToDevice(dataToSend, idx) {
    var objToSend = {};
    var encodedMsg = K_Parser.encode(dataToSend, idx);
    console.log("send to device - ", encodedMsg);

    if (angular.isDefined(_COM_PROPERTIES.translator)) {
        objToSend[_COM_PROPERTIES.translator] = encodedMsg;
    } else objToSend = encodedMsg;

    _COMMUNICATION_OBJECT.send(JSON.stringify(objToSend));
}

function _registerPromiseForCallback(command, promise) {
    if (angular.isUndefined(_PROMISES_CALLBACKS[command.key]))
        _PROMISES_CALLBACKS[command.key] = [];

    _PROMISES_CALLBACKS[command.key].push({
        cmd: command,
        cb: promise
    });
}


/************************
 * UPDATE DATA MANAGEMENT *
 * ********************/
function _put(commandToSend) {// TODO - check usage of second param: (forceObjectModelCallBack)
    var promise = _$q.defer();

    var msg = '';
    var promises = [];
    for (var cmd in commandToSend) {
        try {
            var deferred = _$q.defer();
            if (!commandToSend[cmd].getOnly) {
                commandToSend[cmd].set = true;
                _sendToDevice(commandToSend[cmd]);

                _registerPromiseForCallback(commandToSend[cmd], deferred);

                promises.push(deferred.promise);
            }

        } catch (e) {
            // _translatorError(e); TODO
        }

    }
    _$q.all(promises).then(function (data) {
        return promise.resolve(data);
    }, function (error) {
        return promise.reject(error);
    }, function (data) {
        return promise.resolve(data);
    });

    return promise.promise;
}


/************************
 * Init Class *
 * **********************/

function _init() {
    var communicationReady = _$q.defer();
    if (_COMMUNICATION_OBJECT &&
        _COMMUNICATION_OBJECT.readyState === _COMMUNICATION_OBJECT._readyStateConstants['CONNECTING'])
        return communicationReady.promise;

    _COMMUNICATION_OBJECT = new K_WebSocket(_COM_PROPERTIES.url, _COM_PROPERTIES.protocol);
    // $communication(_COM_PROPERTIES.type, _COM_PROPERTIES.url, _COM_PROPERTIES.protocol);

    _COMMUNICATION_OBJECT.onMessage(function (msgFromDevice) {
        console.log('message: ', msgFromDevice);
        var decodedMsg;
        if (angular.isDefined(_COM_PROPERTIES.translator))
            try {
                msgFromDevice = JSON.parse(msgFromDevice)[_COM_PROPERTIES.translator]
            } catch (e) {

            }
        decodedMsg = K_Parser.decode(msgFromDevice);


        try {
            if (angular.isDefined(decodedMsg)) {
                // $backup.store(decodedMsg); TODO add the backup
                _releasePromiseIfExist(decodedMsg);
                _notifyObservers(decodedMsg);
            }
        } catch (e) {
            console.debug("Unknown message " + e)
        }
    });
    _COMMUNICATION_OBJECT.onOpen(function () {
        communicationReady.resolve();
        _commandsResolver(_COM_PROPERTIES.onInit, communicationReady);
        _startHeartBeat.call(_self);
    });
    _COMMUNICATION_OBJECT.onError(function (event) {
        console.log('connection Error', event);
    });
    _COMMUNICATION_OBJECT.onClose(function (event) {
        console.log('connection CLOSED', event);
        _callbackOnConnectionLost();
        communicationReady.reject(event);
    });


    setInterval(function () {
        if (_STACK.length > 0) {
            _TIMEOUT = false;
            var toSend = _STACK.shift();
            _commandsResolver(toSend.dataToSend, toSend.promise);
        }
    }, _COM_PROPERTIES.timeout);
    return communicationReady.promise;
}

function _releasePromiseIfExist(decodedMsg) {
    if (angular.isDefined(_PROMISES_CALLBACKS[decodedMsg.cmd.key]) && _PROMISES_CALLBACKS[decodedMsg.cmd.key].length > 0) {
        _PROMISES_CALLBACKS[decodedMsg.cmd.key][0].cb.resolve(decodedMsg);
        _PROMISES_CALLBACKS[decodedMsg.cmd.key].shift();
    }
}

function _notifyObservers(decodedMsg) {
    if (_OBSERVERS[decodedMsg.cmd.key]) {
        _OBSERVERS[decodedMsg.cmd.key]
            .forEach(function (moduleToNotify) {
                moduleToNotify.notify(decodedMsg);
            })
    }
}

function _startHeartBeat() {
    if (!_heartBeatInterval) {
        _missedHeartBeats = 0;
        _heartBeatInterval = setInterval(function () {
            if (_missedHeartBeats)
                _onConnectionLost.call(_self);
            _missedHeartBeats++;
            _get([deviceCommands.HAND_SHAKE])
                .then(function (data) {
                    _missedHeartBeats = 0;
                })
        }, 30000);
    }
}

function _onConnectionLost(detail) {
    console.log('DATA_PROXY Connection lost')
    // if (_self.STATUS !== _APP_STATES.RESTARTING) {
    //     if (detail) {
    //         _$rootScope.$emit("CONNECTION_FAILED");
    //         _self.STATUS = _APP_STATES.CONNECTION_FAILED;
    //     } else {
    //         _$rootScope.$emit("CONNECTION_LOST");
    //         _self.STATUS = _APP_STATES.CONNECTION_LOST;
    //     }
    // }
    // _connectToDevice.call(_self);
}
//
//
// (function () {
//     angular.module('core.data')
//
//     /**
//      * @memberof core.communication
//      * @ngdoc factory
//      * @name core.communication.DataProxy
//      * @param {service} CommunicationFactory Factory that creates desired communication
//      * @param {service} ParserFactory protocols parsers
//      * @param {service} DataBackup A backup for data
//      * @param {service} $timeout angular timeout
//      * @param {service} $q angular promises
//      * @returns {object} init, put, get, register
//      * @description
//      *   The DataProxy implement access to device's data.
//      *   It provides API for:
//      *   - PUT (update)
//      *   - GET (read)
//      *   - init (init communication to device)
//      *   - register (to register a module and beeing notified when command arrive)
//      */
//
//
//         .factory('DataProxy', [
//             'CommunicationFactory',
//             'ParserFactory',
//             'DataBackup',
//             '$timeout',
//             '$q',
//             '$interval',
//             function ($communication, $translator, $backup, $timeout, $q, $interval) {
//                 var _self = this;
//                 var _PROMISES_CALLBACKS = {
//                     // commandKey: {cmd, promise}
//                 };
//
//                 var _OBSERVERS = {
//                     // commandKey: {K_Module}
//                 };
//
//                 // can actually be a websocket or polling implementation, will be define @runTime
//                 var _COMMUNICATION_OBJECT = null;
//
//                 // contains all the data to be send
//                 var _STACK = [];
//
//                 // when true, data can be send so it will be added to the _STACK
//                 var _TIMEOUT = false;
//
//
//                 /************************************************************************
//                  * _COM_PROPERTIES contains all the communication definitions to device.
//                  * Available properties are:
//                  * type: http or ws
//                  * url: if undefined, will set the location.host
//                  * timeout: time to wait between each transaction
//                  * connectionAttempts  (optional) This parameter is used when websocket is close will try to reopen it without notifying user of loss
//                  * protocol: 'kramer-p3k-protocol';  for some webSocket we need to defined here the protocol
//                  * useHeartBeat: default to false; If we want to send an handshake to device each 30 seconds
//                  * onInit: Commands to call on communication ready start
//                  * translator: default to 'p3k'; some devices need a json envelope to work: {p3k: /* your p3k command here
//                  * reopenSocketOnTCP: default to false; some devices need a to reopen socket on tcp changed (firmware bug)
//                  * **************************************************************************/
//                 var _COM_PROPERTIES;
//
//
//                 // check usage here
//                 // var _translatorError = function (e) {
//                 //     MessageService.newMessage({
//                 //         title: e.title,
//                 //         type: 'error',
//                 //         isModal: true,
//                 //         closeBtn: false,
//                 //         body: e.message,
//                 //         buttons: [{
//                 //             text: MessageService.button.ok,
//                 //             onClick: function () {
//                 //                 angular.noop();
//                 //             }
//                 //         }]
//                 //     });
//                 // }
//
//
//                 let _heartBeatInterval, _missedHeartBeats;
//
//                 return {
//                     get: _get,
//                     put: _put,
//                     //TODO - updatePipe at the end of that file
//                     init: _init,
//                     moduleRegister: _moduleRegister
//                 };
//
//                 function _moduleRegister(module, triggerCmd) {
//                     if (angular.isUndefined(_OBSERVERS[triggerCmd.key]))// prevent to register same command twice
//                         _OBSERVERS[triggerCmd.key] = [];
//                     _OBSERVERS[triggerCmd.key].push(module);
//
//                 }
//
//                 function _sendToDevice(dataToSend, idx) {
//                     var objToSend = {};
//                     var encodedMsg = $translator.encode(dataToSend, idx);
//                     console.log("send to device - ", encodedMsg);
//
//                     if (angular.isDefined(_COM_PROPERTIES.translator)) {
//                         objToSend[_COM_PROPERTIES.translator] = encodedMsg;
//                     } else objToSend = encodedMsg;
//
//                     _COMMUNICATION_OBJECT.send(JSON.stringify(objToSend));
//                 }
//
//                 /*****************
//                  * Update Data
//                  * @private
//                  */
//                 function _put(commandToSend) {// TODO - check usage of second param: (forceObjectModelCallBack)
//                     var promise = $q.defer();
//
//                     var msg = '';
//                     var promises = [];
//                     for (var cmd in commandToSend) {
//                         try {
//                             var deferred = $q.defer();
//                             if (!commandToSend[cmd].getOnly) {
//                                 commandToSend[cmd].set = true;
//                                 _sendToDevice(commandToSend[cmd]);
//
//                                 _registerPromiseForCallback(commandToSend[cmd], deferred);
//
//                                 promises.push(deferred.promise);
//                             }
//
//                         } catch (e) {
//                             _translatorError(e);
//                         }
//
//                     }
//                     $q.all(promises).then(function (data) {
//                         return promise.resolve(data);
//                     }, function (error) {
//                         return promise.reject(error);
//                     }, function (data) {
//                         return promise.resolve(data);
//                     });
//
//                     return promise.promise;
//                 }
//
//
//                 /****************
//                  *  ProxyData Initialization
//                  * @ngdoc function
//                  * @name communication.DataProxy#_notifyObservers
//                  * @param decodedMsg
//                  * @returns {*}
//                  * @description notify all the observer modules of specific command
//                  * @private
//                  */
//                 function _notifyObservers(decodedMsg) {
//                     if (_OBSERVERS[decodedMsg.cmd.key]) {
//                         _OBSERVERS[decodedMsg.cmd.key]
//                             .forEach(function (moduleToNotify) {
//                                 moduleToNotify.notify(decodedMsg);
//                             })
//                     }
//                 }
//
//                 /****************
//                  *  ProxyData Initialization
//                  * @ngdoc function
//                  * @name communication.DataProxy#_releasePromiseIfExist
//                  * @param decodedMsg
//                  * @returns {*}
//                  * @description release promises waiting for command
//                  * @private
//                  */
//                 function _releasePromiseIfExist(decodedMsg) {
//                     if (angular.isDefined(_PROMISES_CALLBACKS[decodedMsg.cmd.key]) && _PROMISES_CALLBACKS[decodedMsg.cmd.key].length > 0) {
//                         _PROMISES_CALLBACKS[decodedMsg.cmd.key][0].cb.resolve(decodedMsg);
//                         _PROMISES_CALLBACKS[decodedMsg.cmd.key].shift();
//                     }
//                 }
//
//                 /****************
//                  *  ProxyData Initialization
//                  * @ngdoc function
//                  * @name communication.DataProxy#_init
//                  * @param comProp communication properties (come from info file)
//                  * @returns {*}
//                  * @description initialize communication to device and define callbacks onMessage, OnOpen, OnClose and OnError
//                  * @private
//                  */
//                 function _init(comProp, callbackOnConnectionLost) {
//                     var communicationReady = $q.defer();
//                     if (_COMMUNICATION_OBJECT &&
//                         _COMMUNICATION_OBJECT.readyState === _COMMUNICATION_OBJECT._readyStateConstants['CONNECTING'])
//                         return communicationReady.promise;
//
//                     _COM_PROPERTIES = comProp;
//                     _COMMUNICATION_OBJECT = new K_WebSocket(_COM_PROPERTIES.url, _COM_PROPERTIES.protocol);
//                     // $communication(_COM_PROPERTIES.type, _COM_PROPERTIES.url, _COM_PROPERTIES.protocol);
//
//                     _COMMUNICATION_OBJECT.onMessage(function (msgFromDevice) {
//                         console.log('message: ', msgFromDevice);
//                         var decodedMsg;
//                         if (angular.isDefined(_COM_PROPERTIES.translator))
//                             try {
//                                 msgFromDevice = JSON.parse(msgFromDevice)[_COM_PROPERTIES.translator]
//                             } catch (e) {
//
//                             }
//                         decodedMsg = $translator.decode(msgFromDevice);//decode device message
//
//
//                         try {
//                             if (angular.isDefined(decodedMsg)) {
//                                 $backup.store(decodedMsg);
//                                 _releasePromiseIfExist(decodedMsg);
//                                 _notifyObservers(decodedMsg);
//                             }
//                         } catch (e) {
//                             console.debug("Unknown message " + e)
//                         }
//                     });
//                     _COMMUNICATION_OBJECT.onOpen(function () {
//                         _commandsResolver(_COM_PROPERTIES.onInit, communicationReady);
//                         _startHeartBeat.call(_self);
//                     });
//                     _COMMUNICATION_OBJECT.onError(function (event) {
//                         console.log('connection Error', event);
//                     });
//                     _COMMUNICATION_OBJECT.onClose(function (event) {
//                         console.log('connection CLOSED', event);
//                         callbackOnConnectionLost();
//                         communicationReady.reject(event);
//                     });
//
//
//                     $interval(function () {
//                         if (_STACK.length > 0) {
//                             _TIMEOUT = false;
//                             var toSend = _STACK.shift();
//                             _commandsResolver(toSend.dataToSend, toSend.promise);
//                         }
//                     }, _COM_PROPERTIES.timeout);
//                     return communicationReady.promise;
//                 };
//
//
//                 /***********************************************
//                  * GET DATA MANAGEMENT
//                  * @param dataToSend
//                  * @returns {boolean}
//                  * @private
//                  */
//                 function _getData(dataToGet, idx) {
//                     if (dataToGet.length > 0) {
//                         var promises = dataToGet.map(_createPromiseForCommand);
//
//                         if (_COM_PROPERTIES)
//                             (function myDelayedLoop(i) {
//                                 $timeout(function () {
//                                     _TIMEOUT = false;
//                                     _sendToDevice(dataToGet[i]);
//                                     if (dataToGet.length > ++i)
//                                         myDelayedLoop(i);
//                                 }, _COM_PROPERTIES.timeout);
//                             })(0);
//
//                         return promises;
//                     }
//                 }
//
//                 function _registerPromiseForCallback(command, promise) {
//                     if (angular.isUndefined(_PROMISES_CALLBACKS[command.key]))
//                         _PROMISES_CALLBACKS[command.key] = [];
//
//                     _PROMISES_CALLBACKS[command.key].push({
//                         cmd: command,
//                         cb: promise
//                     });
//                 }
//
//                 /**
//                  *
//                  * @param dataToSend
//                  * @returns {boolean}
//                  * @private
//                  */
//                 function _checkDataValidity(dataToSend) {
//                     return (!dataToSend.isSetOnly);
//                 }
//
//                 function _createPromiseForCommand(command) {
//                     var deferred = $q.defer();
//                     command.set = false;
//                     _registerPromiseForCallback(command, deferred);
//                     return deferred.promise;
//                 }
//
//                 function _commandsResolver(dataToSend, promise, idx) {
//                     if (!dataToSend || dataToSend.length === 0)
//                         return promise.resolve();
//                     // each time we send a bulk of command to device we reinitialise the timeout flag
//                     if (!_TIMEOUT) {
//                         _TIMEOUT = true;
//                         return $q.all(_getData(dataToSend, idx))
//                             .then(function (data) {
//                                 return promise.resolve(data);
//                             })
//                             .catch(function (error) {
//                                 return promise.reject(error);
//                             })
//                             .finally(function (data) {
//                                 return promise.resolve(data);
//                             });
//                     } else { // if _TIMEOUT is true we can send the commands so we keep it in a _STACK
//                         _STACK.push({dataToSend: dataToSend, promise: promise});
//                     }
//                 }
//
//                 function _createArrayOfCommands(commandsObj) {
//                     // var toReturn;
//                     // for (var prom in commandsObj) {
//                     //     if (_checkDataValidity(commandsObj[prom]))
//                     // TODO - In es6 we can use it: Object.values(dataToSend); - check compatibility with polyfill
//                     return (Object.keys(commandsObj).map(function (e) {
//                         if (_checkDataValidity(commandsObj[e]))
//                             return commandsObj[e]
//                     }).filter(function (element) {
//                         return element !== undefined;
//                     }));
//                     // else
//                     //
//                     // if (commandsObj[prom].hasOwnProperty('args'))// missing parameters for that command
//                     //     console.log('Command ' + commandsObj[prom].key + ' should have ' + commandsObj[prom].args + ' parameter but get ' + commandsObj[prom].params.length);
//                     // }
//                     // return toReturn;
//                 }
//
//                 // will be resolved when device return all the commands
//                 function _get(commands, idx) {
//                     var deferred = $q.defer();
//                     var dataToBeResolve = _createArrayOfCommands(commands);
//                     _commandsResolver(dataToBeResolve, deferred, idx);
//                     return deferred.promise;
//
//                 }
//
//
//                 function _startHeartBeat() {
//                     let _self = this;
//                     if (!_heartBeatInterval) {
//                         _missedHeartBeats = 0;
//                         _heartBeatInterval = setInterval(function () {
//                             if (_missedHeartBeats)
//                                 _onConnectionLost.call(_self);
//                             _missedHeartBeats++;
//                             _get([deviceCommands.HAND_SHAKE])
//                                 .then(function (data) {
//                                     _missedHeartBeats = 0;
//                                 })
//                         }, 30000);
//                     }
//                 }
//
//
//                 function _onConnectionLost(detail) {
//                     let _self = this;
//                     console.log('DATA_PROXY Connection lost')
//                     // if (_self.STATUS !== _APP_STATES.RESTARTING) {
//                     //     if (detail) {
//                     //         _$rootScope.$emit("CONNECTION_FAILED");
//                     //         _self.STATUS = _APP_STATES.CONNECTION_FAILED;
//                     //     } else {
//                     //         _$rootScope.$emit("CONNECTION_LOST");
//                     //         _self.STATUS = _APP_STATES.CONNECTION_LOST;
//                     //     }
//                     // }
//                     // _connectToDevice.call(_self);
//                 }
//             }])
// })();
