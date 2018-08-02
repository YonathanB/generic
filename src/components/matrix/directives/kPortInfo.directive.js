
(function () {
    angular.module('components.matrix')
    //  K_Port
        .directive('kPortInfo', ['Commands', 'VideoService', '$timeout',// 'MessageService',
            function (Commands, VideoService, $timeout, /*, MessageService*/) {
                return {
                    restrict: 'E',
                    template: require('./k-port-info.html'),// isDebug ? $sce.trustAsResourceUrl(debugURL + 'WebFramework/Controls/html/k-port-info.html') : '/k-port-info.html', //TODO - remove path to be relative!!
                    scope: {
                        portCopy: '@',
                        portsList: '=',
                        routes: '=',
                        onClose: '=',
                        callbackOnClose: '='
                    },
                    link: function (scope, $element, attrs) {
                        var saveBtn = null;
                        $timeout(function () {
                            saveBtn = $element.parent().next().find('#save-btn');
                        }, 0);

                        scope.toSave = {}; // fill updated values
                        scope.toCancel = {};// fill values that can be cancelled
                        scope.port = JSON.parse(scope.portCopy);
                        scope.portLabel = {
                            value: scope.port.label,
                            pattern: /^\S*$/
                        };

                        if (scope.port.masterSignal == 'AUDIO')
                            scope.maxVolume = scope.port.id.indexOf('AMPLIFIED') > -1 ? '30' : '20';

                        scope.$watch('portCopy', function (val) {
                            if (val)
                                scope.port = JSON.parse(scope.portCopy);
                        });
                        // PRIORITY SECTION
                        if (angular.isDefined(scope.port['SWITCH_PRIORITY'])) {
                            scope.selectedAutoSwitch = [];
                            scope.selectableAutoSwitch = {};
                            var defaultValue = 'Add an input';
                            scope.selectableAutoSwitch['default'] = {id: defaultValue, name: defaultValue};
                            scope.current = scope.selectableAutoSwitch['default'];

                            for (var portId in scope.port['SWITCH_PRIORITY']) {
                                if (angular.isDefined(K_Port.getPortsList()[scope.port['SWITCH_PRIORITY'][portId]])
                                    && K_Port.getPortsList()[scope.port['SWITCH_PRIORITY'][portId]].selectedPort)
                                    scope.selectedAutoSwitch.push(K_Port.getPortsList()[scope.port['SWITCH_PRIORITY'][portId]]);
                            }
                            var tmp = VideoService.getVideoSwitch().filter(
                                function (port) {
                                    if (port.selectedPort && scope.port['SWITCH_PRIORITY'].indexOf(port.id) == -1)
                                        return port;
                                }
                            );
                            if (tmp.length == 0) {
                                scope.current = {};
                            }
                            angular.forEach(tmp, function (port) {
                                scope.selectableAutoSwitch[port.id] = port;
                            });
                        }

                        if (scope.port.masterSignal == 'AUDIO')
                            scope.horizontalSlider = true;

                        var routingState;
                        try {
                            routingState = scope.routes[scope.port.id] || scope.routes.outputs[scope.port.id];
                        } catch (e) {
                            console.log('No route for input ' + scope.port.id);
                        }

                        scope.display = {
                            textbox: [{
                                label: 'Port Label',
                                cmdKey: Commands.X_PORT_LABEL.key//TODO
                            }],
                            checkbox: [
                                {
                                    label: 'AFV',
                                    cmdKey: Commands.AFV.key
                                }, {
                                    label: 'HDCP Support',
                                    cmdKey: Commands.HDCP_MOD.key//todo
                                }, {
                                    label: 'Force RGB',
                                    cmdKey: Commands.EDID_CS.key
                                }, {
                                    label: 'Force 2LPCM',
                                    cmdKey: Commands.EDID_AUDIO.key
                                }
                                // {
                                //     label: 'Audio only',
                                //     cmdKey: Commands.X_AUD_ONLY.key
                                // }
                            ],
                            combo: [{
                                options: VideoService.patterns(),
                                label: 'Video Pattern',
                                cmdKey: Commands.X_VIDEO_PATTERN.key
                            }, {//this combo MUST be the last!!
                                options: K_Port.autoSwitchOptions,
                                label: 'Auto Switching',
                                cmdKey: Commands.AUTO_SWITCH.key
                            }],
                            comboSub: {},
                            routingState: {
                                label: 'Routing Status',
                                value: routingState
                            }

                        };

                        if (scope.port.direction === 'input') {
                            angular.forEach(['AUDIO', 'RS232', 'IR', 'USB'], function (flwr) {
                                if (scope.port.followers && scope.port.followers[flwr]) {
                                    scope.display.comboSub[flwr] = {
                                        options: (function () {
                                            var options = [];
                                            if (flwr != 'AUDIO')
                                                options.push({
                                                    label: "None",
                                                    value: 0
                                                });

                                            options.push({
                                                label: scope.port.name,
                                                value: scope.port.id
                                            });
                                            if (flwr !== 'IR') {
                                                angular.forEach(scope.port.followers[flwr].list,
                                                    function (port) {
                                                        if (port.selectedPort)
                                                            options.push({
                                                                label: port.name ? port.name : port.name,
                                                                value: port.id
                                                            });
                                                    });
                                            }
                                            if (flwr === 'AUDIO') {
                                                angular.forEach(K_Port.getPortByMasterSignal('VIDEO'),
                                                    function (port) {
                                                        if (port.direction == scope.port.direction && port.selectedPort && port.id !==  scope.port.id)
                                                            options.push({
                                                                label: port.name ? port.name : port.name,
                                                                value: port.id
                                                            });
                                                    });
                                            }
                                            return options;
                                        })(),
                                        label: flwr,
                                        cmdKey: Commands.X_FOLLOWERS.key
                                        // signalType: flwr
                                    };
                                }
                            });
                        }

                        $element.parents('.dialog-box').click(function (event) {
                            if (angular.element(event.target).hasClass('dialog-box'))
                                scope.onClose();
                        });
                        scope.$on("$destroy", function () {
                            $element.parents('.dialog-box').unbind('click');
                        });

                    },
                    controller: function ($scope) {
                        // following functions update after save
                        $scope.update = function (CommandKey, value) {
                            $scope.toSave[CommandKey] = {
                                "port": $scope.port,
                                "cmd": CommandKey,
                                "value": angular.isDefined(value) ? value : $scope.port[CommandKey]
                            };
                            $scope.callbackOnClose($scope.toSave);
                        };

                        $scope.updateFollower = function (CommandKey, signal, value) {
                            var val = {};
                            val[signal] = value;
                            for (var sgnl in $scope.port.followers) {
                                if ($scope.port.followers[sgnl] && $scope.port.followers[sgnl].selected) {
                                    if (val[sgnl] != 0 && !val[sgnl])
                                        val[sgnl] = $scope.port.followers[sgnl].selected;
                                    else if (val[sgnl] == 0)
                                        delete val[sgnl];
                                }
                            }
                            $scope.toSave[CommandKey] = {
                                "port": $scope.port,
                                "cmd": Commands.X_FOLLOWERS.key,
                                "value": val
                            };
                            $scope.callbackOnClose($scope.toSave);
                        };
                        $scope.updateCombo = function (CommandKey, value) {
                            // if (CommandKey === 'AUTO_SWITCH' && $scope.port[Commands.AUTO_SWITCH.key] === 0 && !$scope.port[Commands.AFV.key] && (value === 1 || value === 2))
                            //     MessageService.newMessage({
                            //         title: 'Pay Attention',
                            //         type: 'alert',
                            //         isModal: true,
                            //         closeBtn: false,
                            //         body: '<p>Audio Follow Video is currently disabled!<br>' +
                            //         'Audio <i title="audio isn\'t following video signal" style="text-decoration-style: dotted;text-decoration: underline;">break-away</i> may happen during video auto-switching</p>' +
                            //         '<p style="font-size: 14px; font-weight: bold">Prevent break-away by enable <i>Audio Follow video</i>?</p>',
                            //         buttons: [{
                            //             text: MessageService.button.no,
                            //             onClick: function () {
                            //                 angular.noop();
                            //             }
                            //         },
                            //             {
                            //                 text: MessageService.button.yes,
                            //                 onClick: function () {
                            //                     $scope.update(Commands.AFV.key, 1);
                            //                     $scope.port[Commands.AFV.key] = true;
                            //                 }
                            //             }]
                            //     });
                            $scope.toSave[CommandKey] = {
                                "port": $scope.port,
                                "cmd": CommandKey,
                                "value": value
                            };
                            $scope.callbackOnClose($scope.toSave);
                        };
                        $scope.updatePortlabel = function (CommandKey, value) {
                            $scope.toSave[CommandKey] = {
                                "port": $scope.port,
                                "cmd": CommandKey,
                                "value": value
                            };
                            $scope.callbackOnClose($scope.toSave);
                        };
                        $scope.toggleMicType = function (newValue) {
                            $scope.update(Commands.X_MIC_TYPE.key, newValue);
                            $scope.port[Commands.X_MIC_TYPE.key] = newValue;
                        };
                        $scope.toggleLONG_REACH = function (newValue) {
                            $scope.update(Commands.X_LONG_REACH.key, newValue);
                            $scope.port[Commands.X_LONG_REACH.key] = newValue;
                        };
                        $scope.toggleAudioOnly = function (newValue) {
                            $scope.update(Commands.X_AUD_ONLY.key, newValue);
                            $scope.port[Commands.X_AUD_ONLY.key] = newValue;
                        };

                        // following functions update online
                        $scope.updateVolume = function (value) {
                            $scope.portsList.updateDevice($scope.port, Commands.AUDIO_VOLUME.key, value)
                                .then(function (data) {
                                    // $scope.port[Commands.AUDIO_VOLUME.key] = value;
                                }, function () {
                                    console.log('ERROR');
                                })
                        };
                        $scope.mute = function () {
                            $scope.portsList.updateDevice($scope.port, Commands.X_MUTE.key, !$scope.port[Commands.X_MUTE.key]['AUDIO'])
                                .then(function (data) {
                                    $scope.port[Commands.X_MUTE.key]['AUDIO'] = !$scope.port[Commands.X_MUTE.key]['AUDIO'];
                                }, function () {
                                    console.log('ERROR');
                                })
                        };


                        //PRIORITY SECTION
                        var updatePriority = function () {
                            var toUpdate = [];
                            angular.forEach($scope.selectedAutoSwitch, function (port) {
                                toUpdate.push(port.id);
                            });
                            $scope.toSave[Commands.SWITCH_PRIORITY.key] = {
                                "port": $scope.port,
                                "cmd": Commands.SWITCH_PRIORITY.key,
                                "value": toUpdate
                            };
                            $scope.callbackOnClose($scope.toSave);
                        };
                        $scope.addPriority = function (port, newValue) {
                            if (newValue && newValue !== $scope.selectableAutoSwitch['default'].id) {
                                $scope.selectedAutoSwitch.push(K_Port.getPortsList()[newValue]);
                                delete $scope.selectableAutoSwitch[newValue];
                                updatePriority();
                            }
                            if (Object.keys($scope.selectableAutoSwitch).length > 1) {
                                $scope.current = $scope.selectableAutoSwitch['default'];
                            }
                        };
                        $scope.removePriority = function (port, value, idx) {
                            // if (Object.keys($scope.selectedAutoSwitch).length <= 2) {
                            //     MessageService.newMessage({
                            //         title: 'Can not remove input!',
                            //         type: 'alert',
                            //         isModal: true,
                            //         closeBtn: false,
                            //         body: '<p>Priority must have at least two inputs. </p>',
                            //         buttons: [{
                            //             text: MessageService.button.ok,
                            //             onClick: function () {
                            //                 angular.noop();
                            //             }
                            //         }]
                            //     });
                            //     return false;
                            // }


                            if (value) {
                                $scope.selectableAutoSwitch[value] = K_Port.getPortsList()[value];
                                $scope.selectedAutoSwitch.splice(idx, 1);
                                updatePriority();
                            }
                            if (Object.keys($scope.selectableAutoSwitch).length > 1) {
                                $scope.current = $scope.selectableAutoSwitch['default'];
                            }
                        };
                        $scope.dragControlListeners = {
                            orderChanged: function (event) {
                                updatePriority();
                            }
                        };


                    }
                }
            }])
})();