/***********************************************
 * File Name:
 * Created by: Yonathan Benitah
 * On: 06/11/2016  12:29
 * Last Modified: 06/11/2016
 * Modified by: ybenitah
 ***********************************************/

(function () {

    angular.module('web.controllers')
    //TODO move to global directive files
        .directive('stringToNumber', function () {
            return {
                require: 'ngModel',
                link: function (scope, element, attrs, ngModel) {
                    ngModel.$parsers.push(function (value) {
                        return '' + value;
                    });
                    ngModel.$formatters.push(function (value) {
                        return parseFloat(value);
                    });
                }
            };
        })
        .filter("toArray", function () {
            return function (input) {
                if (!input) return;

                if (input instanceof Array) {
                    return input;
                }

                return $.map(input, function (val) {
                    return val;
                });
            };
        })
        .controller('switcherCtrl', [
            '$scope',
            '$filter',
            '$timeout',
            'K_Port',
            'deviceModel',
            'videoPatterns',
            'Commands',
            'VideoService',
            function ($scope, $filter, $timeout, K_Port, applicationService, videoPatterns, Commands, VideoService) {
                if (!K_Port.isDetailDataReady())//Don't want to load details in router-resolve
                    deviceModel.portsList.initPortsDetails();

                $scope.portsList = deviceModel.matrix;
                $scope.ouputMechanicalName = deviceModel.ouputMechanicalName;
                $scope.videoPatterns = videoPatterns;
                $scope.videoPatterns = {
                    options: VideoService.patterns(),
                    label: 'Video Pattern',
                    cmdKey: Commands.X_VIDEO_PATTERN.key
                };

                //ROUTING
                $scope.saveProcess = {};
                $scope.route = function (newInput) {
                    $scope.saveProcess[newInput.id] = true;
                    deviceModel.matrix.update({
                        input: newInput,
                        output: deviceModel.matrix.outputs['OUT.HDMI.1'],
                        signal: 'VIDEO'
                    }).then(function (data) {
                        $scope.saveProcess[newInput.id] = false;
                    });
                };


                //Setting popup (Priority + timeout)
                $scope.showSettings = false;
                $scope.toggleSettings = function (event) {
                    if (angular.isUndefined(event)) {
                        $scope.showSettings = !$scope.showSettings;
                        $scope.timeoutSaveFailed = false;
                    }
                };
                //TIMEOUTS
                $scope.timeoutVM = {};
                if (!deviceModel.timeouts.initialized)
                     deviceModel.timeouts.init().then(function(){
                         $scope.videoTimeout = deviceModel.timeouts.data;
                         // $scope.timeoutVM = angular.copy($scope.videoTimeout)
                    })

                else {
                    $scope.videoTimeout = deviceModel.timeouts.data;
                    // $scope.timeoutVM = angular.copy($scope.videoTimeout)
                }
                $scope.timeoutToUpdate = {};
                $scope.updateVideoTimeout = function (value, idx) {
                    $scope.timeoutVM[idx] = value;
                    if($scope.videoTimeout[idx] != $scope.timeoutVM[idx])
                         $scope.timeoutToUpdate[idx] = value;
                    else
                        delete $scope.timeoutToUpdate[idx]
                };

                $scope.isEmpty = function(obj) {
                    return angular.equals(obj, {});
                };

               var sendTimeout = function(){
                   return deviceModel.timeouts.update($scope.timeoutToUpdate)
                       .then(function (response) {
                           $scope.errorMsg = '';
                           $scope.timeoutSaveFailed = false;
                           for (var i = 0; response.data.length > i; i++) {

                               if (angular.isDefined(response.data[i].errCode)) {
                                   $scope.timeoutSaveFailed = true;
                                   $scope.errorMsg += 'Failed to update' + response.data[i].cmd.key + '\n';
                               }
                           }
                           $scope.timeoutToUpdate = {};
                       });
               };
                $scope.updateTimer = function() {
                    sendTimeout($scope.timeoutToUpdate).then(function(){
                        for(var timeout in $scope.timeoutVM){
                            if($scope.videoTimeout[timeout] != $scope.timeoutVM[timeout] && !$scope.timeoutToUpdate[timeout])
                                $scope.timeoutToUpdate[timeout] = $scope.timeoutVM[timeout];
                        }
                        if(!angular.equals($scope.timeoutToUpdate, {}))
                            sendTimeout();
                    })



                }
                $scope.maxTimeout = function (timeout) {
                    if (timeout == 0 || timeout == 5)
                        return Math.min(90, $scope.timeoutVM.AV_SW_TIMEOUT_4, $scope.timeoutVM.AV_SW_TIMEOUT_7);
                };
                $scope.minTimeout = function () {
                    return Math.max($scope.timeoutVM.AV_SW_TIMEOUT_5, $scope.timeoutVM.AV_SW_TIMEOUT_0);
                };
                //PRIORITY
                $scope.switchMode = {options: K_Port.autoSwitchOptions};
                var updatePriority = function () {
                    var toUpdate = [];
                    angular.forEach($scope.selectedAutoSwitch, function (port) {
                        toUpdate.push(port.id);
                    });
                    $scope.updatePriority(toUpdate);
                    console.log('UPDATE PRIORITY');
                };
                $scope.dragControlPriority = {
                    orderChanged: function (event) {
                        updatePriority();
                    }
                };
                $scope.$watch('portsList.outputs[\'OUT.HDMI.1\'][\'SWITCH_PRIORITY\']', function (val) {

                    if (val) {
                        $scope.selectedAutoSwitch = [];
                        for (var portId in  val) {
                            $scope.selectedAutoSwitch.push(deviceModel.matrix.inputs[val[portId]]);
                        }
                    }
                });
                $scope.updatePriorityMode = function (value) {
                    deviceModel.portsList.updateDevice($scope.portsList.outputs['OUT.HDMI.1'], Commands.AUTO_SWITCH.key, value);
                };
                $scope.updatePriority = function (value) {
                    deviceModel.portsList.updateDevice(deviceModel.matrix.outputs['OUT.HDMI.1'], Commands.SWITCH_PRIORITY.key, value);
                };


                //Setting flip-flap (Inputs config)
                $scope.flip = false;
                $scope.currentInput = null;
                //FUNCTIONS IN SETTING PORTS
                $scope.toggleInputConfig = function (input) {
                    // $scope.flip = !$scope.flip

                    if (angular.isDefined(input)) {
                        $scope.portLabel = {
                            value: input.label,
                            pattern: /^\S*$/
                        };
                        if (!$scope.flip || angular.equals(input, $scope.currentInput))
                            $scope.flip = !$scope.flip;
                        $scope.currentInput = input;

                        $scope.$watch('currentInput[\'X_FOLLOWERS\'].AUDIO[0]', function (val) {
                            console.log(val);
                            if (val) {
                                setAudioFollowers();
                            }
                        });

                        var setAudioFollowers = function () {
                            $scope.AudioFollowers = [];
                            if (angular.isDefined($scope.currentInput[Commands.X_FOLLOWERS.key])) {
                                for (var i = 0; i < $scope.currentInput[Commands.X_FOLLOWERS.key]['AUDIO'].length; i++) {
                                    $scope.AudioFollowers.push($scope.portsList.inputs[$scope.currentInput[Commands.X_FOLLOWERS.key]['AUDIO'][i]])
                                }
                            }
                            else {
                                $scope.AudioFollowers = [input, $scope.portsList.inputs['IN.ANALOG_AUDIO.1']];
                            }
                        }
                    }
                    else if ($scope.flip) {
                        $scope.flip = !$scope.flip;
                        // $scope.currentInput = null;
                    }

                    if ($scope.flip)
                        $scope.dragControlFollowers = {
                            orderChanged: function (event) {
                                $scope.updateFollower();
                            }
                        };
                };
                $scope.togglePriorityFollower = function (value) {
                    deviceModel.portsList.updateDevice($scope.currentInput, Commands.X_FOLLOWERS_SW_MODE.key, value);
                };
                $scope.toggleHDCP = function (value) {
                    if(value == 1)
                        value = 3;
                    deviceModel.portsList.updateDevice($scope.currentInput, Commands.HDCP_MOD.key, value, 'MIRROR');
                };
                $scope.updateEdid = function (cmdProperty) {
                    deviceModel.portsList.updateDevice($scope.currentInput, cmdProperty, $scope.currentInput[cmdProperty]);
                };
                $scope.command = {};
                $scope.toggleCommand = function (cmdKey, param, value) {
                    deviceModel.portsList.updateDevice(deviceModel.matrix.outputs['OUT.HDMI.1'], cmdKey, (angular.isDefined(value) ? value : (angular.isDefined(param) ? !deviceModel.matrix.outputs['OUT.HDMI.1'][cmdKey][param] : !deviceModel.matrix.outputs['OUT.HDMI.1'][cmdKey])), param);
                };


                //FUNCTIONS FOR OUTPUTS 
                $scope.updatePattern = function (value) {
                    deviceModel.portsList.updateDevice($scope.portsList.outputs['OUT.HDMI.1'], Commands.X_VIDEO_PATTERN.key, value);
                    $timeout(function(){
                        if($scope.sliderIsOpen)
                            $scope.sliderIsOpen = false;
                    }, 500)
                };
                $scope.updateVolume = function (value) {
                    deviceModel.portsList.updateDevice($scope.portsList.outputs['OUT.ANALOG_AUDIO.1'], Commands.AUDIO_VOLUME.key, value);
                };
                $scope.mute = function () {
                    deviceModel.portsList.updateDevice($scope.portsList.outputs['OUT.ANALOG_AUDIO.1'], Commands.X_MUTE.key, !$scope.portsList.outputs['OUT.ANALOG_AUDIO.1'][Commands.X_MUTE.key]['AUDIO']);
                };
                $scope.updateFollower = function (mainFollower) {
                    if (angular.isDefined(mainFollower) && $scope.AudioFollowers[0].id != mainFollower) { // swap position
                        var newFirst = $scope.AudioFollowers[1];
                        $scope.AudioFollowers[1] = $scope.AudioFollowers[0];
                        $scope.AudioFollowers[0] = newFirst;
                    }
                    deviceModel.portsList.updateDevice($scope.currentInput, Commands.X_FOLLOWERS.key, {"AUDIO": [$scope.AudioFollowers[0].id, $scope.AudioFollowers[1].id]});
                };
                $scope.updatePortlabel = function () {
                    deviceModel.portsList.updateDevice($scope.currentInput, Commands.X_PORT_LABEL.key, $scope.portLabel.value);
                };

                $scope.tunnelCtrl = function (port, idx) {
                    console.log(port, idx);
                    deviceModel.updateDevice({
                        command: Commands.TUNNEL_CTRL,
                        value: '0,' + port.portIndex+',"VID '+idx+'>1"'
                    })
                        .then(function(){
                            
                        })
                };
                
                
                //SLIDER FOR VIDEO PATTERN - TODO: directive
                var timeoutId = null;
                $scope.sliderIsOpen = false;
                $scope.toggleMouseOver = function (event, commandKey, commandName, param) {
                    if (event.type == 'mouseenter' && event.currentTarget.className != 'online-settings' || angular.isUndefined(commandKey))
                        return true;
                    else if ($scope.sliderIsOpen) {// && timeoutId && timeoutId.$$state.status != 1) {
                        if (event.type == 'click') {
                            $scope.command = {};
                            $scope.sliderIsOpen = false;
                        }
                        else if (event.currentTarget.className != 'online-settings') {
                            timeoutId = $timeout(function () {
                                $scope.command = {};
                                $scope.sliderIsOpen = false;
                            }, 600);
                        }
                    }
                    else if (timeoutId && timeoutId.$$state.status == 0) $timeout.cancel(timeoutId);
                    else{//} if (angular.equals({}, $scope.command)) {
                        $scope.sliderIsOpen = true;
                        $scope.command['key'] = commandKey;
                        $scope.command['name'] = commandName;
                        $scope.command['param'] = param;
                        // $scope.command['value'] = $scope.port[commandKey] ? 1 : 0;
                    }
                };
                var closePattern = function (event) {
                    if (event.target.localName == 'select' && event.type == 'click'){//} || event.type == 'mouseleave' ) {
                        var options = angular.element(event.target).find('option').get();
                        for (var i = 0; i < options.length; i++) {
                            options[i].off('click', closePattern)
                        }
                    }
                    timeoutId = $timeout(function () {
                        $scope.command = {};
                        $scope.sliderIsOpen = false;
                    }, 600);
                };
                var fn = function (event) {
                    if (event.target.localName == 'select' && window.utils.browserName !== 'Chrome') {
                        var options = angular.element(event.target).find('option').get();
                        for (var i = 0; i < options.length; i++) {
                            angular.element(options[i]).on('click', closePattern)
                        }
                        return;
                    }

                    closePattern(event);
                };
                angular.element('.online-settings').on('mouseleave', function (event) {
                    if ($scope.sliderIsOpen)
                        fn(event);
                });
            }]);


    angular.module('web.controllers').directive("flip", function () {

        function setDim(element, width, height) {
            element.style.width = width;
            element.style.height = height;
        }

        return {
            restrict: "E",
            controller: function ($scope, $element, $attrs) {

                var self = this;
                self.front = null,
                    self.back = null;


                function showFront() {
                    self.front.removeClass("flipHideFront");
                    self.back.addClass("flipHideBack");
                }

                function showBack() {
                    self.back.removeClass("flipHideBack");
                    self.front.addClass("flipHideFront");
                }

                self.init = function () {
                    self.front.addClass("flipBasic");
                    self.back.addClass("flipBasic");

                    showFront();

                    $scope.$watch('flip', function (value) {
                        if (angular.isDefined(value)) {
                            if (value)
                                showBack();
                            else
                                showFront();
                        }
                    });
                    // self.front.on("click", showBack);
                    // self.back.on("click", showFront);
                }

            },

            link: function (scope, element, attrs, ctrl) {

                var width = attrs.flipWidth || "100px",
                    height = attrs.flipHeight || "100px";

                element.addClass("flip");

                if (ctrl.front && ctrl.back) {
                    [element, ctrl.front, ctrl.back].forEach(function (el) {
                        setDim(el[0], width, height);
                    });
                    ctrl.init();
                }
                else {
                    console.error("FLIP: 2 panels required.");
                }

            }
        }

    });

    angular.module('web.controllers').directive("flipPanel", function () {
        return {
            restrict: "E",
            require: "^flip",
            //transclusion : true,
            link: function (scope, element, attrs, flipCtr) {
                if (!flipCtr.front) {
                    flipCtr.front = element;
                }
                else if (!flipCtr.back) {
                    flipCtr.back = element;
                }
                else {
                    console.error("FLIP: Too many panels.");
                }
            }
        }
    });

})();