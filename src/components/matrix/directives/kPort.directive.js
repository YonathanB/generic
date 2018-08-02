
(function () {
    angular.module('components.matrix')
        .directive('kPort', ['Commands', '$timeout', 'VideoService', 'ConnectorsFactory',
            function (Commands, $timeout, VideoService, ConnectorsFactory) {

                var currentDropdown = angular.element('body').find('.dropdown.open');
                angular.element('body').click(function (evt) {
                    var clickedElem = angular.element(evt.target).parents('.dropdown');
                    if (clickedElem.length == 0)
                        currentDropdown.removeClass('open');
                    else
                        currentDropdown = clickedElem;
                });

                return {
                    restrict: 'E',
                    template: require('./k-port.html'),
                    scope: {
                        port: '=',
                        portType: '@',
                        matrix: '=?',
                        openInfo: '&onClick',
                        portsList: '='
                    },
                    link: function (scope, $elem, attrs) {
                        scope.sliderIsOpen = false;
                        scope.videoPatterns = {
                            options: VideoService.patterns(),
                            label: 'Video Pattern',
                            cmdKey: Commands.X_VIDEO_PATTERN.key
                        };

                        if (scope.port.direction == 'input' && scope.port.supportedSignals.indexOf('AUDIO') > -1)
                            scope.port.waves = true;

                        if (angular.isDefined(scope.matrix) && angular.isDefined(scope.matrix.routes)) {
                            scope.$watchCollection('matrix.routes', function (newRoutes) {
                                var title;
                                scope.port.title = '';
                                title = scope.matrix.routes[scope.port.id];
                                for (var signal in title) {
                                    scope.port.title += signal + ':';
                                    for (var i = 0; i < title[signal].length; i++) {
                                        scope.port.title += ' ' + (angular.isDefined(scope.matrix.input[title[signal][i]]) ?
                                            scope.matrix.input[title[signal][i]].name : scope.matrix.output[title[signal][i]].name);
                                        scope.port.title += '-'
                                    }
                                    scope.port.title = scope.port.title.slice(0, -1); // remove last char ('-')
                                    scope.port.title += '\n'; // go to next line
                                }
                            });
                        }


                        scope.command = {};
                        var timeoutId = null;
                        scope.toggleMouseOver = function (event, commandKey, commandName, param) {
                            if (event.type == 'mouseenter' && event.currentTarget.className != 'online-settings')
                                return true;
                            else if (scope.sliderIsOpen) {// && timeoutId && timeoutId.$$state.status != 1) {
                                if (event.type == 'click') {
                                    scope.command = {};
                                    scope.sliderIsOpen = false;
                                }
                                else if (event.currentTarget.className != 'online-settings') {
                                    timeoutId = $timeout(function () {
                                        scope.command = {};
                                        scope.sliderIsOpen = false;
                                    }, 600);
                                }
                            }
                            else if (timeoutId && timeoutId.$$state.status == 0) $timeout.cancel(timeoutId);
                            else if (angular.equals({}, scope.command)) {
                                scope.sliderIsOpen = true;
                                scope.command['key'] = commandKey;
                                scope.command['name'] = commandName;
                                scope.command['param'] = param;
                                scope.command['value'] = scope.port[commandKey] ? 1 : 0;
                            }
                        };

                        $elem.on('mouseleave', function (event) {
                            if (scope.sliderIsOpen && event.target.localName !== 'i' && (event.target.localName !== 'k-port' && event.target.localName !== 'select')) {
                                timeoutId = $timeout(function () {
                                    scope.command = {};
                                    scope.sliderIsOpen = false;
                                }, 600);
                            }
                        });

                        if (scope.port.masterSignal === 'AUDIO')
                            scope.maxVolume = scope.port.id.indexOf('AMPLIFIED') > -1 ? '30' : '20';
                    },
                    controller: function ($scope, Commands) {

                        $scope.Commands = Commands;

                        $scope.openDropdown = function (evt, id) {
                            if (angular.isDefined($scope.port.switchablePort) && angular.isUndefined($scope.combo)) {

                                $scope.combo = {
                                    options: (function () {
                                        var tmp = [];
                                        for (var i = 0; $scope.matrix.switchablePorts[$scope.port.switchableGroupName].options.length > i; i++) {
                                            var splited = $scope.matrix.switchablePorts[$scope.port.switchableGroupName].options[i].split(',');

                                            var tmpLbl = '';
                                            for (var j = 0; j < splited.length; j++) {
                                                tmpLbl += $scope.portsList[splited[j]].name + ' ';
                                            }
                                            tmp.push({
                                                label: tmpLbl,
                                                value: $scope.matrix.switchablePorts[$scope.port.switchableGroupName].options[i]
                                            });
                                        }
                                        return tmp;
                                    }()),
                                    label: 'Port Type',
                                    cmdKey: Commands.X_PORT_SELECT.key
                                };
                            }
                            var clickedPort = angular.element(evt.target).parents('.dropdown');


                            if (currentDropdown.length > 0 && currentDropdown.attr('id') != id)
                                currentDropdown.removeClass('open');

                            if (clickedPort.attr('id') == id) {
                                if (clickedPort.hasClass('open'))
                                    clickedPort.removeClass('open');
                                else
                                    clickedPort.addClass('open');
                            }


                        };
                        $scope.openPortInfo = function (port) {
                            $scope.openInfo({port: port})
                        };
                        $scope.switchPort = function (portId, event) {
                            $scope.saveProcess = true;
                            $scope.openDropdown(event, portId)
                            $scope.portsList.updateDevice($scope.port, Commands.X_PORT_SELECT.key, portId)
                                .then(function () {
                                    $scope.saveProcess = false;
                                }, function () {
                                    $scope.saveProcess = false;
                                });
                        };

//TOGGLE COMMANDS FOR ICONS
                        $scope.updateCombo = function (cmdKey, value) {
                            $scope.portsList.updateDevice($scope.port, cmdKey, value);
                            $timeout(function () {
                                $scope.command = {};
                                $scope.sliderIsOpen = false;
                            }, 600);
                        };
                        $scope.toggleCommand = function (cmdKey, param, value) {
                            $scope.portsList.updateDevice($scope.port, cmdKey, (angular.isDefined(value) ? value : (angular.isDefined(param) ? !$scope.port[cmdKey][param] : !$scope.port[cmdKey])), param);
                        };

                        $scope.updateVolume = function (value) {
                            $scope.portsList.updateDevice($scope.port, Commands.AUDIO_VOLUME.key, value);
                        };
                    }


                }
            }])
})();