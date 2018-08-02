/***********************************************
 * File Name:
 * Created by: Yonathan Benitah
 * On: 17/08/2016  08:28
 * Last Modified: 02/08/2018
 * Modified by: ybenitah
 ***********************************************/

let _kWebSocket,
    _options

;

export default class K_WebSocket {
    constructor(url, protocols, options) {
        _kWebSocket = new WebSocket('ws://' + url, protocols);
        _options = options;

    }

    onMessage(cb) {
        _kWebSocket.onmessage = function (msg) {
            cb(msg.data);
        }
    }

    onError(cb) {
        _kWebSocket.onerror = cb;
    }

    onClose(cb) {
        _kWebSocket.onclose = cb;
    }

    onOpen(cb) {
        _kWebSocket.onopen = function (event) {
            console.log('Socket open ', event);
            cb();
        }
    }

    send(msg) {
        _kWebSocket.send(msg);
    }

    // startHeartBeat() {
    //     if (!_heartBeatInterval) {
    //         _missedHeartBeats = 0;
    //         _heartBeatInterval = setInterval(function () {
    //             if (_missedHeartBeats)
    //                 onLostConnection();
    //             _missedHeartBeats++;
    //             DataProxy.get([Commands.HAND_SHAKE])
    //                 .then(function (data) {
    //                     _missedHeartBeats = 0;
    //                 })
    //         }, 30000);
    //     }
    // }

    // angular.bind(this, this._onMessageHandler);

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