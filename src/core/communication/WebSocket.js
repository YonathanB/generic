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


(function () {
    var objectDefineProperty = Object.defineProperty;
    var arraySlice = Array.prototype.slice;
    var isObject = angular.isObject;
    var isString = angular.isString;
    var isFunction = angular.isFunction;
    angular.module('core.communication')
        .factory('WebSocket', [
            '$rootScope', '$q', '$timeout',
            function ($rootScope, $q, $timeout) {

                function $WebSocket(url, protocols, options) {
                    if (!options && isObject(protocols) && !isArray(protocols)) {
                        options = protocols;
                        protocols = undefined;
                    }

                    this.protocols = protocols;
                    this.url = url || 'Missing URL';
                    // this.ssl = /(wss)/i.test(this.url); TODO secured Web socket

                    // TODO: refactor options to use isDefined
                    this.scope = options && options.scope || $rootScope;
                    this.rootScopeFailover = options && options.rootScopeFailover && true;
                    this.useApplyAsync = options && options.useApplyAsync || false;
                    this.initialTimeout = options && options.initialTimeout || 500; // 500ms
                    this.maxTimeout = options && options.maxTimeout || 5 * 60 * 1000; // 5 minutes
                    this.reconnectIfNotNormalClose = options && options.reconnectIfNotNormalClose || false;
                    this.binaryType = options && options.binaryType || 'blob';

                    this._reconnectAttempts = 0;
                    this.sendQueue = [];
                    this.onOpenCallbacks = [];
                    this.onMessageCallbacks = [];
                    this.onErrorCallbacks = [];
                    this.onCloseCallbacks = [];

                    if (url) {
                        this._connect();
                    } else {
                        this._setInternalState(0);
                    }
                }

                $WebSocket.prototype._readyStateConstants = {
                    'CONNECTING': 0,
                    'OPEN': 1,
                    'CLOSING': 2,
                    'CLOSED': 3,
                    'RECONNECT_ABORTED': 4
                };
                $WebSocket.prototype._normalCloseCode = 1000;
                $WebSocket.prototype._reconnectableStatusCodes = [
                    4000
                ];

                $WebSocket.prototype.safeDigest = function safeDigest(autoApply) {
                    if (autoApply && !this.scope.$$phase) {
                        this.scope.$digest();
                    }
                };

                // Notify functions
                $WebSocket.prototype.notifyOpenCallbacks = function notifyOpenCallbacks(event) {
                    for (var i = 0; i < this.onOpenCallbacks.length; i++) {
                        this.onOpenCallbacks[i].call(this, event);
                    }
                };
                $WebSocket.prototype.notifyErrorCallbacks = function notifyErrorCallbacks(event) {
                    for (var i = 0; i < this.onErrorCallbacks.length; i++) {
                        this.onErrorCallbacks[i].call(this, event);
                    }
                };

                // Trigger the websocket send function
                $WebSocket.prototype.fireQueue = function fireQueue() {
                    while (this.sendQueue.length && this.socket.readyState === this._readyStateConstants.OPEN) {
                        var data = this.sendQueue.shift();
                        this.socket.send(
                            isString(data.message) || this.binaryType != 'blob' ? data.message : JSON.stringify(data.message)
                        );
                        data.deferred.resolve();
                    }
                };


                // Handler functions
                $WebSocket.prototype._onMessageHandler = function _onMessageHandler(message) {
                    var pattern;
                    var self = this;
                    var currentCallback;
                    for (var i = 0; i < self.onMessageCallbacks.length; i++) {
                        currentCallback = self.onMessageCallbacks[i];
                        pattern = currentCallback.pattern;
                        if (pattern) {
                            if (isString(pattern) && message.data === pattern) {
                                applyAsyncOrDigest(currentCallback.fn, currentCallback.autoApply, message.data);
                            }
                            else if (pattern instanceof RegExp && pattern.exec(message.data)) {
                                applyAsyncOrDigest(currentCallback.fn, currentCallback.autoApply, message.data);
                            }
                        }
                        else {
                            applyAsyncOrDigest(currentCallback.fn, currentCallback.autoApply, message.data);
                        }
                    }

                    function applyAsyncOrDigest(callback, autoApply, args) {
                        args = arraySlice.call(arguments, 2);
                        if (self.useApplyAsync) {
                            self.scope.$applyAsync(function () {
                                callback.apply(self, args);
                            });
                        } else {
                            callback.apply(self, args);
                            self.safeDigest(autoApply);
                        }
                    }

                };
                $WebSocket.prototype._onOpenHandler = function _onOpenHandler(event) {
                    this._reconnectAttempts = 0;
                    this.notifyOpenCallbacks(event);
                    this.fireQueue();
                };
                $WebSocket.prototype._onErrorHandler = function _onErrorHandler(event) {
                    var self = this;
                    if (self.useApplyAsync) {
                        self.scope.$applyAsync(function () {
                            self.notifyErrorCallbacks(event);
                        });
                    } else {
                        self.notifyErrorCallbacks(event);
                        self.safeDigest(true);
                    }
                };
                $WebSocket.prototype._onCloseHandler = function _onCloseHandler(event) {
                    var self = this;
                    if (self.useApplyAsync) {
                        self.scope.$applyAsync(function () {
                            self.notifyCloseCallbacks(event);
                        });
                    } else {
                        self.notifyCloseCallbacks(event);
                        self.safeDigest(true);
                    }
                    if ((this.reconnectIfNotNormalClose && event.code !== this._normalCloseCode) || this._reconnectableStatusCodes.indexOf(event.code) > -1) {
                        this.reconnect();
                    }
                };

                $WebSocket.prototype.notifyCloseCallbacks = function notifyCloseCallbacks(event) {
                    for (var i = 0; i < this.onCloseCallbacks.length; i++) {
                        this.onCloseCallbacks[i].call(this, event);
                    }
                };
                // Bind handlers to socket
                $WebSocket.prototype._connect = function _connect(force) {
                    if (force || !this.socket || this.socket.readyState !== this._readyStateConstants.OPEN) {
                        this.socket = new WebSocket(this.url, this.protocols);
                        this.socket.onmessage = angular.bind(this, this._onMessageHandler);
                        this.socket.onopen = angular.bind(this, this._onOpenHandler);
                        this.socket.onerror = angular.bind(this, this._onErrorHandler);
                        this.socket.onclose = angular.bind(this, this._onCloseHandler);
                        this.socket.binaryType = this.binaryType;
                    }
                };
                $WebSocket.prototype.reconnect = function reconnect() {
                    this.close();

                    var backoffDelay = this._getBackoffDelay(++this._reconnectAttempts);

                    var backoffDelaySeconds = backoffDelay / 1000;
                    console.log('Reconnecting in ' + backoffDelaySeconds + ' seconds');

                    $timeout(angular.bind(this, this._connect), backoffDelay);

                    return this;
                };
                $WebSocket.prototype._getBackoffDelay = function _getBackoffDelay(attempt) {
                    var R = Math.random() + 1;
                    var T = this.initialTimeout;
                    var F = 2;
                    var N = attempt;
                    var M = this.maxTimeout;

                    return Math.floor(Math.min(R * T * Math.pow(F, N), M));
                };
                $WebSocket.prototype._setInternalState = function _setInternalState(state) {
                    if (Math.floor(state) !== state || state < 0 || state > 4) {
                        throw new Error('state must be an integer between 0 and 4, got: ' + state);
                    }

                    // ie8 wat
                    if (!objectDefineProperty) {
                        this.readyState = state || this.socket.readyState;
                    }
                    this._internalConnectionState = state;


                    forEach(this.sendQueue, function (pending) {
                        pending.deferred.reject('Message cancelled due to closed socket connection');
                    });
                };


                if (objectDefineProperty) {
                    objectDefineProperty($WebSocket.prototype, 'readyState', {
                        get: function () {
                            return this._internalConnectionState || this.socket.readyState;
                        },
                        set: function () {
                            throw new Error('The readyState property is read-only');
                        }
                    });
                }

                $WebSocket.prototype.close = function close(force) {
                    if (force || !this.socket.bufferedAmount) {
                        this.socket.close();
                    }
                    return this;
                };
                $WebSocket.prototype.send = function send(dataToSend) {

                    var deferred = $q.defer();
                    var promise = deferred.promise; // cancelableify(
                    var self = this;
                    if (self.readyState === self._readyStateConstants.RECONNECT_ABORTED) {
                        deferred.reject('Socket connection has been closed');
                    }
                    else {
                        self.sendQueue.push({
                            message: dataToSend,
                            deferred: deferred
                        });
                        self.fireQueue();
                    }
                    return promise;
                };

                $WebSocket.prototype.onOpen = function onOpen(cb) {
                    this.onOpenCallbacks.push(cb);
                    return this;
                };

                $WebSocket.prototype.onClose = function onClose(cb) {
                    this.onCloseCallbacks.push(cb);
                    return this;
                };

                $WebSocket.prototype.onError = function onError(cb) {
                    this.onErrorCallbacks.push(cb);
                    return this;
                };

                $WebSocket.prototype.onMessage = function onMessage(callback, options) {
                    if (!isFunction(callback)) {
                        throw new Error('Callback must be a function');
                    }

                    if (options && isDefined(options.filter) && !isString(options.filter) && !(options.filter instanceof RegExp)) {
                        throw new Error('Pattern must be a string or regular expression');
                    }

                    this.onMessageCallbacks.push({
                        fn: callback,
                        pattern: options ? options.filter : undefined,
                        autoApply: options ? options.autoApply : true
                    });
                    return this;
                };


                return function (url, protocols, options) {
                    return new $WebSocket('ws://' + url, protocols, options);
                };
            }]);

})();