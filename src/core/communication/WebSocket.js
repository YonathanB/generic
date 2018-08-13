/**
 * @fileOverview The data module define the access to device data through the web app
 * @module core/communication
 */

import {deviceCommands} from "../data/Commands";

/**
 * @property {Object} _kWebSocket - The websocket object
 */
let _kWebSocket;

/**
 * @property {Object} _options - options that define the websocket object
 */
let _options;


/**
 * @property {Object} _STACK - data to be send
 */
let _STACK = [];

/**
 * @property {Object} _gTimeout - if inferior to _options.timeout, data won't be send but
 * be inserted in _STACK
 */
let _gTimeout = [];

let _checktimeoutInterval;

const _SOCKET_STATE = Object.freeze({
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
    RECONNECT_ABORTED: 4
});


let _self;

/**
 * @name K_WebSocket
 * @module K_WebSocket
 * @kind class
 * @param {string} url - indicates the url to connect
 * @param {string} protocol - indicates protocol (if there is any)
 * @param {object} options - options for that connection
 */
class K_WebSocket {

    constructor(url, protocol, options) {
        _kWebSocket = new WebSocket('ws://' + url, protocol);
        _options = options;
        _self = this;

        _self.onOpenCallbacks = [];
        _self.onCloseCallbacks = [];
        _self.onErrorCallbacks = [];
        _self.onMessageCallbacks = [];


        _kWebSocket.onopen = angular.bind(this, _onOpenHandler);
        _kWebSocket.onclose = angular.bind(this, _onCloseHandler);
        _kWebSocket.onerror = angular.bind(this, _onErrorHandler);
        _kWebSocket.onmessage = angular.bind(this, _onMessageHandler);
    }

    /**
     * @param cb - Callback function defined in K_WebSocket instance
     * @returns {function} - function to call on socket message
     * @function
     */
    onMessage(cb) {
        _self.onMessageCallbacks.push(cb);
        return this;
    }

    /**
     * @param cb - Callback function defined in K_WebSocket instance
     * @returns {function} - function to call on socket error
     * @function
     */
    onError(cb) {
        _self.onErrorCallbacks.push(cb);
        return this;
    }


    /**
     * @param cb - Callback function defined in K_WebSocket instance
     * @returns {function} - function to call when socket close
     * @function
     */
    onClose(cb) {
        _self.onCloseCallbacks.push(cb);
        return this;
    }


    /**
     * @param cb - Callback function defined in K_WebSocket instance
     * @returns {function} - function to call when socket open
     * @function
     */
    onOpen(cb) {
        _self.onOpenCallbacks.push(cb);
        return this;
    }


    /**
     * @param message - Message to send, coming from K_DataProxy instance
     * @function
     * @description The send function will check if device is ready to receive data
     * ( set by timeout variable in info file)
     *
     * If device is not ready it will insert the message to the `_STACK`.
     *
     */
    send(message) {
        let _currentTimeout = new Date();
        if (_gTimeout - _currentTimeout > _options.timeout
            || _SOCKET_STATE.CONNECTING === _kWebSocket.readyState)
            _STACK.push(message);
        else if (_SOCKET_STATE.OPEN === _kWebSocket.readyState) {
            _gTimeout = _currentTimeout;
            _kWebSocket.send(message);
        }
    }
}


export default K_WebSocket;

function _onOpenHandler(event){
        console.log('Socket open ', event);
        _gTimeout = new Date();
        _checkStack();
    for (let i = 0; i < _self.onOpenCallbacks.length; i++) {
        _self.onOpenCallbacks[i].call(_self, event);
    }
}


function _onCloseHandler(event){
    clearInterval(_checktimeoutInterval);
    for (let i = 0; i < _self.onCloseCallbacks.length; i++) {
        _self.onCloseCallbacks[i].call(_self, event);
    }
}


function _onErrorHandler(event){
    for (let i = 0; i < _self.onErrorCallbacks.length; i++) {
        _self.onErrorCallbacks[i].call(_self, event);
    }
}
function _onMessageHandler(msg){
    for (let i = 0; i < _self.onMessageCallbacks.length; i++) {
        _self.onMessageCallbacks[i].call(_self, msg.data);
    }
}



function _checkStack() {
    _checktimeoutInterval = setInterval(function () {
        if (_STACK.length > 0) {
            var toSend = _STACK.shift();
            _self.send(toSend);
        }
    }, _options.timeout);
}
