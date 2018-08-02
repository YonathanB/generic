/***********************************************
 * File Name:
 * Created by: Yonathan Benitah
 * On: 29/12/2016  12:21
 * Last Modified: 29/12/2016
 * Modified by: ybenitah
 ***********************************************/
import X2JS from 'x2js'
(function () {
    angular.module('core.communication')
        .factory('Polling', ['$rootScope', '$q', '$interval', '$http', '$timeout', function ($rootScope, $q, $interval, $http, $timeout) {
            var isFunction = angular.isFunction;
            var arraySlice = Array.prototype.slice;
            var _host = null;
            var x2js = new X2JS();

            function $httpCommunication(url, protocols, options) {
                // if (!options && isObject(protocols) && !isArray(protocols)) {
                //     options = protocols;
                //     protocols = undefined;
                // }
                //
                // this.protocols = protocols;
                this.url = url || 'Missing URL';
                // // this.ssl = /(wss)/i.test(this.url); TODO secured Web socket
                //
                // // TODO: refactor options to use isDefined
                this.scope                       = options && options.scope                      || $rootScope;
                // this.rootScopeFailover           = options && options.rootScopeFailover          && true;
                // this.useApplyAsync               = options && options.useApplyAsync              || false;
                // this.initialTimeout              = options && options.initialTimeout             || 500; // 500ms
                // this.maxTimeout                  = options && options.maxTimeout                 || 5 * 60 * 1000; // 5 minutes
                // this.reconnectIfNotNormalClose   = options && options.reconnectIfNotNormalClose  || false;
                // this.binaryType                  = options && options.binaryType                 || 'blob';
                //
                // this._reconnectAttempts = 0;
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
                this._pauseKeepAlive = 0;
            }

            $httpCommunication.prototype.pauseKeepAlive = function(pause) {
                this._pauseKeepAlive = parseInt(pause) ? parseInt(pause) : 2000;
            }

            $httpCommunication.prototype._readyStateConstants = {
                'CONNECTING': 0,
                'OPEN': 1,
                'CLOSING': 2,
                'CLOSED': 3,
                'RECONNECT_ABORTED': 4
            };

            $httpCommunication.prototype.safeDigest = function safeDigest(autoApply) {
                if (autoApply && !this.scope.$$phase) {
                    this.scope.$digest();
                }
            };

            // Notify functions
            $httpCommunication.prototype.notifyOpenCallbacks = function notifyOpenCallbacks(event) {
                for (var i = 0; i < this.onOpenCallbacks.length; i++) {
                    this.onOpenCallbacks[i].call(this, event);
                }
            };
            $httpCommunication.prototype.notifyErrorCallbacks = function notifyErrorCallbacks(event) {
                for (var i = 0; i < this.onErrorCallbacks.length; i++) {
                    this.onErrorCallbacks[i].call(this, event);
                }
            };

            // Trigger the websocket send function
            $httpCommunication.prototype.fireQueue = function fireQueue() {
                while (this.sendQueue.length && this.socket.readyState === this._readyStateConstants.OPEN) {
                    var data = this.sendQueue.shift();
                    this.socket.send(
                        isString(data.message) || this.binaryType != 'blob' ? data.message : JSON.stringify(data.message)
                    );
                    data.deferred.resolve();
                }
            };


            // Handler functions
            $httpCommunication.prototype._onMessageHandler = function _onMessageHandler(message) {
                var pattern;
                var self = this;
                var currentCallback;
                var returnedMsg = x2js.xml_str2json(message.data).form.data;
                // var returnedMsg = JSON.stringify({'p3k': jsonMsg.value});
                if (angular.isDefined(returnedMsg.value) && returnedMsg.value.trim() != "") {
                    for (var i = 0; i < self.onMessageCallbacks.length; i++) {
                        currentCallback = self.onMessageCallbacks[i];
                        pattern = currentCallback.pattern;

                        if (pattern) {
                            if (isString(pattern) && message.data === pattern) {
                                applyAsyncOrDigest(currentCallback.fn, currentCallback.autoApply, returnedMsg.value);
                            }
                            else if (pattern instanceof RegExp && pattern.exec(message.data)) {
                                applyAsyncOrDigest(currentCallback.fn, currentCallback.autoApply, returnedMsg.value);
                            }
                        }
                        else {
                            applyAsyncOrDigest(currentCallback.fn, currentCallback.autoApply, returnedMsg.value);
                        }
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
            $httpCommunication.prototype._onOpenHandler = function _onOpenHandler(event) {
                this._reconnectAttempts = 0;
                this.notifyOpenCallbacks(event);
                this.fireQueue();
            };
            $httpCommunication.prototype._onErrorHandler = function _onErrorHandler(event) {
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
            $httpCommunication.prototype._onCloseHandler = function _onCloseHandler(event) {
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

            // Bind handlers to socket
            $httpCommunication.prototype._connect = function _connect(force) {
                var _self = this;
                $interval(function () {
                    if (_self._pauseKeepAlive > 0) {
                        _self._pauseKeepAlive -= 500;
                    } else {
                        $http.get('http://' + _self.url + '/test.cgx?').then(
                            function (data) {
                                _self._onMessageHandler(data);
                                console.log('coucou', data);
                            },
                            function (data) {
                                console.log('coucou', data);
                            })
                    }
                }, 500);
            };
            // $httpCommunication.prototype._setInternalState = function _setInternalState(state) {
            //     if (Math.floor(state) !== state || state < 0 || state > 4) {
            //         throw new Error('state must be an integer between 0 and 4, got: ' + state);
            //     }
            //
            //     // ie8 wat
            //     if (!objectDefineProperty) {
            //         this.readyState = state || this.socket.readyState;
            //     }
            //     this._internalConnectionState = state;
            //
            //
            //     forEach(this.sendQueue, function(pending) {
            //         pending.deferred.reject('Message cancelled due to closed socket connection');
            //     });
            // };


            // if (objectDefineProperty) {
            //     objectDefineProperty($httpCommunication.prototype, 'readyState', {
            //         get: function() {
            //             return this._internalConnectionState || this.socket.readyState;
            //         },
            //         set: function() {
            //             throw new Error('The readyState property is read-only');
            //         }
            //     });
            // }

            $httpCommunication.prototype.send = function send(dataToSend) {
                var _self = this;
                return $http.get('http://' + _self.url + '/test.cgx?cmd='+ JSON.parse(dataToSend).p3k.replace('#', '')).then(
                    function (data) {
                        _self._onMessageHandler(data);
                    },
                    function (data) {
                        console.log('coucou', data);
                    });
            };

            $httpCommunication.prototype.onOpen = function onOpen(cb) {
                this.onOpenCallbacks.push(cb);
                return this;
            };

            $httpCommunication.prototype.onClose = function onClose(cb) {
                this.onCloseCallbacks.push(cb);
                return this;
            };

            $httpCommunication.prototype.onError = function onError(cb) {
                this.onErrorCallbacks.push(cb);
                return this;
            };

            $httpCommunication.prototype.onMessage = function onMessage(callback, options) {
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
                var conn = new $httpCommunication(url, protocols, options);
                $timeout(function(){
                    // conn.onOpen()
                    conn.notifyOpenCallbacks()
                }, 200);
                return conn;
            };
        }])
})();
