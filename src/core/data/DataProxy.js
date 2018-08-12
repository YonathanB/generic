/**
 * @fileOverview The data module define the access to device data through the web app
 * @module core/data
 * @requires module:core/communication
 * @requires deviceCommands
 * @requires K_Parser
 */
import K_WebSocket from '../communication/WebSocket';
import {deviceCommands} from "../data/Commands";
import {K_Parser} from "../parsers/ParserFactory";
import DataBackup from "./DataBackup";

/**
 * @property {Object} _PROMISES_CALLBACKS - Contains all the callback to notify the UI
 * when an update on device has been done
 * object as {key: value}, Where key is the command key and value is an object: {cmd, promise}
 * => commandKey: {cmd, promise}
 */
let _PROMISES_CALLBACKS = {};

/**
 * @property {Object} _COMMUNICATION_OBJECT - Contains instance of active communication.
 *
 * `websocket` - In case of communication to device is websocket
 *
 * `polling` - In case of polling
 */
let _COMMUNICATION_OBJECT = null;


/**
 * @property {Object} _COM_PROPERTIES - contains communication definition
 *
 * `type` -  **http** for polling or **ws** for websocket
 *
 * `url` - Device IP Default: location.host (IP on browser)
 *
 * `protocol` - relevant only for websocket communication  - default to kramer-p3k-protocol
 *
 * `timeout`-  time to wait between each transaction. As said, the K_DataProxy regulate transaction to device  - Default to 0
 *
 * `connectionAttempts` - When websocket closed will try to reopen it without notifying user of lost communication
 *
 * `translator`: relevant only for websocket. By default every message is wrap as follow **{'p3k': theP3Kcommand}**
 */
let _COM_PROPERTIES;

let _toSend = [];

let _OBSERVERS = {};

let _heartBeatInterval, _missedHeartBeats;


let _self, _$q, _callbackOnConnectionLost, _callbackOnMessage;



/**
 * Class to access data
 * @name K_WebSocket
 * @module K_DataProxy
 * @kind class
 * @param {Object} $q - The x value.
 * @param {Object} comProp - communication properties.
 * @param {function} callbackOnConnectionLost - callback to deviceModel on communication lost.
 * */
class K_DataProxy {
    constructor($q, comProp, callbacks) {
        _self = this;
        _$q = $q;
        _COM_PROPERTIES = comProp;
        _callbackOnConnectionLost = callbacks.onConnectionLost;
        this.communicationDescriptor = comProp;
        this.model = new DataBackup();
    }

    /**
     * @param commands - Commands as array or object
     * @param idx - Optional.
     * @returns {Promise} - Promise will return Array of Commands
     * @function
     * @description  Promise that will be resolved when device return all the data requested
     */
    get(commands, idx) {

        // TODO - check if data exist in backup
        // if exist parse and return data
        // else parse and send to socket
        return _get(commands, idx)
    }

    /**
     * @param commandToSend - Commands as array or object
     * @param idx - Optional.
     * @returns {Promise} - The resolve of that promise contains Array of commands
     * @function
     * @description  Promise that will be resolved when device return all the data requested
     */
    put(commandToSend) {
       return _put(commandToSend)
    }

    /**
     * @returns {Promise} - Will be resolve when K_DataProxy is synchronized with device
     * @function
     * @description  Enable communication with device and ask for preliminary data
     */
    start() {
        return _init();
    }
    getData(){
        return this.model;
    }
    getValue(key){
        return this.model.get(key);
    }

}


/************************
 * GET DATA MANAGEMENT *
 * ********************/
function _get(commands, idx=1, force=false) {
    var deferred = _$q.defer();
    var dataToBeResolve = _createArrayOfCommands(commands);
    _commandsResolver(dataToBeResolve, deferred, idx, force);
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

function _commandsResolver(dataToSend, promise, idx = 1, force = false) {
    if (!dataToSend || dataToSend.length === 0)
        return promise.resolve();
        return _$q.all(_getData(dataToSend, idx, force))
            .then(function (data) {
                return promise.resolve(data);
            })
            .catch(function (error) {
                return promise.reject(error);
            })
            .finally(function (data) {
                return promise.resolve(data);
            });
}

function _getData(dataToGet, idx, force) {
    if (dataToGet.length > 0) {
        return dataToGet.map(function(cmd){
            if(force || !_self.model.valueExists(cmd.key)) {// prevent sending request if also have it in store
                // if(!_self.model.valueExists(cmd.key))
                //     _self.model.createProperty(cmd.key);

                _sendToDevice(cmd);// we can improve it by preventing send it if already sent and waiting for response
                return _createPromiseForCommand(cmd);
            }
        });
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

    if (angular.isDefined(_COM_PROPERTIES.translator)) {
        objToSend[_COM_PROPERTIES.translator] = encodedMsg;
    } else objToSend = encodedMsg;

    if(!_COMMUNICATION_OBJECT){
        _toSend.push(dataToSend);
        return;
    }
    _COMMUNICATION_OBJECT.send(JSON.stringify(objToSend));
    console.log("send to device - ", encodedMsg);
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

    _COMMUNICATION_OBJECT = new K_WebSocket(_COM_PROPERTIES.url, _COM_PROPERTIES.protocol, _COM_PROPERTIES);
    // TODO - communication can be polling $communication(_COM_PROPERTIES.type, _COM_PROPERTIES.url, _COM_PROPERTIES.protocol);

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

                _self.model.store(decodedMsg);
                _releasePromiseIfExist(decodedMsg);
                _notifyObservers(decodedMsg);
            }
        } catch (e) {
            console.debug("Unknown message " + e)
        }
    });
    _COMMUNICATION_OBJECT.onOpen(function () {
        communicationReady.resolve();
        _commandsResolver([deviceCommands.MODEL, deviceCommands.NAME].concat(_toSend), communicationReady);
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
            _get([deviceCommands.HAND_SHAKE],1, true)
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


export default K_DataProxy;
