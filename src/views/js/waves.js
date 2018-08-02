 angular.module('kramerWeb').directive('kWaves', ['$sce', '$timeout',
        function ($sce, $timeout) {
            var RACKS_TYPE = [
                {key: 'OFF', value: 'off'},
                {key: 'MICROPHONE', value: 'mic'},
                {key: 'MUSIC', value: 'msc'},
                {key: 'SOUND', value: 'snd'}
            ];

            var PRESETS = ['Huddle Space', 'Boardroom', 'Auditorium'];



            return {
                restrict: 'E',
                templateUrl: isDebug ? $sce.trustAsResourceUrl('Partials/html/waves.html') : 'waves.html', //TODO - remove path to be relative!!
                // replace: true,
                scope: {
                    kId: '@?',
                    rackChanged: '&onRackDataChanged',
                    pluginChanged: '&onPluginDataChanged',
                    rackMode: '&onRackModeChanged',
                    currentRackMode: '=?',
                    jsonModel: '=',
                    metaJson: '=?'
                },
                link: function (scope, $element, attrs) {
                    scope.$watch('jsonModel', function(val){
                        if(val)
                            initRack(scope.currentRackMode);
                    });
                    scope.isRackOpen = false;
                    scope.presetIndex = 0;
                    scope.currentRack = {
                        id: scope.kId,
                        type: RACKS_TYPE[scope.currentRackMode].key,
                        preset: PRESETS[scope.presetIndex]
                    };
                    var initRack = function(rackMode){
                        if(rackMode != 0) {
                            scope.currentRack = scope.jsonModel[RACKS_TYPE[rackMode].value];
                            scope.currentRack.id = scope.kId;
                            scope.currentRack.preset = PRESETS[scope.presetIndex];
                        }
                            scope.currentRack.type = RACKS_TYPE[rackMode].key;

                    };

                    scope.toggleRack = function () {
                        scope.isRackOpen = !scope.isRackOpen;
                        if(scope.isRackOpen)
                            initRack(scope.currentRackMode);
                    };

                    scope.selectRack = function (rackType) {
                        initRack(rackType);
                        scope.currentRackMode = rackType;
                        scope.rackMode({data:rackType});
                    };
                    scope.changePreset = function (preset) {
                        scope.presetIndex =  (preset == '+1') ? Math.abs(++scope.presetIndex)%3 : Math.abs(--scope.presetIndex)%3;
                        scope.currentRack.preset = PRESETS[scope.presetIndex];
                    };

                    scope.enableVolume = function () {
                        scope.currentVolume = scope.currentRack.volume;
                        scope.volumeEnabled = !scope.volumeEnabled;
                    };
                    scope.pluginChange = function (pluginIndex, opCode, newValue) {
                        console.log(scope.currentRack.id, scope.currentRack.type, pluginIndex, opCode, newValue);
                        scope.pluginChanged({
                            data: {
                                id: scope.kId,
                                plugin: pluginIndex,
                                opCode: opCode,
                                value: newValue
                            }
                        });
                    };
                    scope.rackChange = function (opCode, newValue) {
                        if (opCode == 'VOLUME' && newValue) {
                            scope.currentRack.volume = newValue;
                            scope.volumeEnabled = false;
                        }
                        scope.rackChanged({data: {id: scope.kId, opCode: opCode, value: newValue}});
                    };
                },
                controller: function ($scope) {
                    $scope.WavesMeta = {
                        "operations": {
                            "MUTE": {
                                "description": "Mute on/off",
                                "type": "Binary",
                                "default": 0
                            },
                            "BYPASS": {
                                "description": "Bypass on/off",
                                "type": "Binary",
                                "default": 0
                            },
                            "VOLUME": {
                                "description": "Volume up/down 1 unit num times",
                                "type": "NumericRange",
                                "units": "DB",
                                "default": 0,
                                "max": 18,
                                "min": -18,
                                "step": 1
                            },
                            "SETUP": {
                                "description": "Setup Button Pressed",
                                "type": "Unary"
                            },
                            "SUGGEST": {
                                "description": "WNS Suggest",
                                "type": "Unary"
                            },
                            "PRESET": {
                                "description": "Next/Previous",
                                "type": "Spinner"
                            }
                        },
                        "plugins": {
                            "Q10": {
                                "name": "Q10",
                                "description": "paragraphic EQ",
                                "operations": [
                                    "BYPASS"
                                ]
                            },
                            "XFDBK": {
                                "name": "XFDBK",
                                "description": "Feedback Suppressor",
                                "operations": [
                                    "SETUP"
                                ]
                            },
                            "WNS": {
                                "name": "WNS",
                                "description": "Noise Suppressor",
                                "operations": [
                                    "SUGGEST"
                                ]
                            },
                            "C1": {
                                "name": "C1",
                                "description": "C1 Compressor",
                                "operations": [
                                    "BYPASS"
                                ]
                            },
                            "GEQ": {
                                "name": "GEQ",
                                "description": "30 Band Equalizer",
                                "operations": [
                                    "BYPASS"
                                ]
                            },
                            "L1": {
                                "name": "L1",
                                "description": "Ultramaximizer Peak Limiter",
                                "operations": [
                                    "BYPASS"
                                ]
                            },
                            "eMoGenerator": {
                                "name": "eMoGenerator",
                                "description": "Signal Generator",
                                "operations": [
                                    "BYPASS"
                                ]
                            },
                            "RenComp": {
                                "name": "RenComp",
                                "description": "Renaissance Compressor",
                                "operations": [
                                    "BYPASS"
                                ]
                            },
                            "MaxxVolume": {
                                "name": "MaxxVolume",
                                "description": "Volume Leveler",
                                "operations": [
                                    "BYPASS"
                                ]
                            },
                            "OneKnobPhatter": {
                                "name": "OneKnob Phatter",
                                "description": "Bass Booster",
                                "operations": [
                                    "BYPASS"
                                ]
                            },
                            "OneKnobLouder": {
                                "name": "OneKnob Louder",
                                "description": "Increase RMS",
                                "operations": [
                                    "BYPASS"
                                ]
                            },
                            "MaxxBass": {
                                "name": "MaxxBass",
                                "description": "Bass Enhancer",
                                "operations": [
                                    "BYPASS"
                                ]
                            },
                            "Vitamin": {
                                "name": "Vitamin",
                                "description": "Multiband harmonic enhancer and tone-shaping",
                                "operations": [
                                    "BYPASS"
                                ]
                            },
                            "C6": {
                                "name": "C6",
                                "description": "Multiband Compressor",
                                "operations": [
                                    "BYPASS"
                                ]
                            }
                        },
                        "rackTypes": {
                            "MICROPHONE": {
                                "operations": [
                                    "MUTE",
                                    "BYPASS",
                                    "VOLUME"
                                ],
                                "plugins": [
                                    "Q10",
                                    "XFDBK",
                                    "WNS",
                                    "C1",
                                    "GEQ",
                                    "L1",
                                    "eMoGenerator"
                                ]
                            },
                            "MUSIC": {
                                "operations": [
                                    "MUTE",
                                    "BYPASS",
                                    "VOLUME"
                                ],
                                "plugins": [
                                    "GEQ",
                                    "WNS",
                                    "RenComp",
                                    "MaxxVolume",
                                    "OneKnobPhatter",
                                    "OneKnobLouder",
                                    "L1"
                                ]
                            },
                            "SOUND": {
                                "operations": [
                                    "MUTE",
                                    "BYPASS",
                                    "VOLUME"
                                ],
                                "plugins": [
                                    "Q10",
                                    "MaxxBass",
                                    "MaxxVolume",
                                    "Vitamin",
                                    "C6",
                                    "L1"
                                ]
                            }
                        }
                    };
                }
            }
        }]);