/***********************************************
 * File Name: K_Matrix
 * Created by: Yonathan Benitah
 * On: 24/11/2016  17:03
 * Last Modified: 24/11/2016
 * Modified by: ybenitah
 ***********************************************/
(function () {
    angular.module('components.matrix')
        .factory('K_Port', [
            'ConnectorsFactory',
            // 'K_ProxyService',
            'VideoService',
            'Commands',
            '$q',
            '$timeout',
            '$exceptionHandler',
            function (ConnectorsFactory/*, K_Proxy*/, VideoService, Commands, $q, $timeout, $exceptionHandler) {
                var _matrixDescriptor;
                var _initialized = false;
                var _MatrixPortsList = {
                    input: {},
                    output: {}
                };
                var _matrixHasSwitchablePorts = false;
                var _detailIsReady = false;
                var _PortsList = {};
                var _PortsTypes = [];
                var _PortsByIndex = {};
                var _PortsByMasterSignal = {};
                var _overviewPortInitialized = false;

                var _PortCommands = {
                    overview: {
                        input: {},
                        output: {}
                    },
                    detail: {
                        input: {},
                        output: {}
                    },
                    filters: {}

                };

                // callback functions
                var _portDirection = null;
                var _ifPortConfigurable = null;
                var _noRouting = null;
                var _ifPortHasFollowers = null;


                const _setPortDirection = function(port){
                    if(_matrixDescriptor.hasOwnProperty('bothPortsDirection')) {
                        let toInputsPort = _matrixDescriptor['bothPortsDirection'].input;
                        let toOutputsPort = _matrixDescriptor['bothPortsDirection'].output;
                        if (toInputsPort && toOutputsPort)
                            if ((toInputsPort.indexOf(port) > -1 || port.indexOf('IN') > -1)
                                && toOutputsPort.indexOf(port) === -1)
                                return 'input';
                            else
                                return 'output';
                    } else {
                        if (port.indexOf('IN') > -1) return 'input';
                        else return 'output';
                    }
                };
                const _setFollowers = function(port) {
                    if (_matrixDescriptor.hasOwnProperty('followers')) {
                        console.log("followers")
                    }
                };


                var IO_port = function (portId, type, index, direction, configurablePort, commands) {
                    this.commands = commands || {};
                    this.portIndex = index;
                    this.portType = type;
                    this.direction = direction;
                    this.id = portId;
                    if (this.portType.indexOf('USB') > -1)
                        this.name = type.replace('_', ' Type- ') + index;
                    else
                        this.name = type.replace('_', ' ') + ' ' + index;
                    this.label = null;
                    this.supportedSignals = ConnectorsFactory.ports[type];
                    this.selectedPort = true;
                    this.signal = false;
                    this.masterSignal = angular.isDefined(ConnectorsFactory.masterSignal[type]) ?
                        ConnectorsFactory.masterSignal[type] : this.supportedSignals[0];
                    this.configurablePort = angular.isDefined(configurablePort) ? configurablePort : false;

                    this.followers = null;
                    this.followerMode = {};
                    if (this.supportedSignals.length > 1 && this.direction == 'input') {
                        this.followers = {};
                        for (var i = 0; i < this.supportedSignals.length; i++) {
                            if (this.supportedSignals[i] != this.masterSignal) {
                                this.followers[this.supportedSignals[i]] = {
                                    list: [], //id, label
                                    selected: null
                                }
                            }
                        }
                    }
                    return this;
                };

                var _getPortData = function (dataToGet) {
                    // dataToGet = angular.copy(dataToGet);
                    // var devicePorts = Object.create(this);

                    //check for validity
                    // for (var cmd in dataToGet) {
                    //     devicePorts.commands[dataToGet[cmd].key] = dataToGet[cmd];
                    //     devicePorts.registerCommand.call(devicePorts, dataToGet[cmd]);
                    //     if (angular.isDefined(dataToGet[cmd].args) && angular.isDefined(dataToGet[cmd].params))
                    //         if (!dataToGet[cmd].params || dataToGet[cmd].params.length != dataToGet[cmd].args)
                    //             delete dataToGet[cmd];
                    // }


                    //remove filtered value
                    for (var cmd in dataToGet) {
                        for (var port in _PortCommands.filters) {
                            if (_PortCommands.filters[port].indexOf(dataToGet[cmd].key) > -1 && dataToGet[cmd].params.indexOf(port) > -1)
                                delete dataToGet[cmd];
                        }
                    }
                    return dataToGet;
                    // devicePorts.get(dataToGet).then(function (data) {
                    //     for (var i = 0; i < data.length; i++) {
                    //         var parsedData = {params: null, value: null};
                    //         if (!data[i].errCode && angular.isDefined(data[i].cmd.parserOnMessage))
                    //             parsedData = data[i].cmd.parserOnMessage(data[i].value);
                    //
                    //         devicePorts.data[data[i].cmd.key] = {};
                    //         devicePorts.refresh.call(devicePorts, data[i]);
                    //     }
                    // });
                };

                var _builPortCommand = function (commands, port, signal) {
                    var tmp = [];
                    for (var i = 0; i < commands.length; i++) {
                        if (typeof commands[i] == 'string')
                            tmp.push(angular.copy(Commands.commandsByOpCode[commands[i]]));
                        tmp[i].parserOnSend(port, undefined, signal);
                    }
                    // TODO - call filter here!
                    return tmp;
                };

                var _initPortCommands = function (overviewOrDetail, port) { // dataType can be overview or detail
                    var _portCommands, tst;
                    if (angular.isArray(_PortCommands[overviewOrDetail][port.direction][port.portType])) {
                        // _portCommands = _builPortCommand(_PortCommands[overviewOrDetail][port.direction][port.portType], port);
                        _portCommands = _PortCommands[overviewOrDetail][port.direction][port.portType];
                         this.appendCommands(_portCommands, {port: port})
                            // promises.push(_getPortData.call(this, _portCommands));
                            }
                    else {
                        for (var signal in  _PortCommands[overviewOrDetail][port.direction][port.portType]) {
                            // _portCommands = _builPortCommand(_PortCommands[overviewOrDetail][port.direction][port.portType][signal], port, signal);
                            _portCommands = _PortCommands[overviewOrDetail][port.direction][port.portType][signal];
                            this.appendCommands(_portCommands, {port: port, signal: signal})
                            // tst = new K_Module(_portCommands, null, null, {port: port, signal: signal});
                            // promises.push(_getPortData.call(this, _portCommands));
                        }
                        return this.init().then(function(data){
                            console.log("cool!!", data);
                            return data;
                        })
                    }
                    // return _portCommands;
                };

                var _initPortsOverview = function () {
                    var deferred = $q.defer();
                    var promises = [];
                    if (_overviewPortInitialized)
                        return;
                    for (var id in _PortsList) {
                        promises.push(_initPortCommands.call(this, 'overview', _PortsList[id]));
                    }
                    $q.all(promises).then(function(data){
                        deferred.resolve(data)
                    })
                    return deferred.promise;
                };

                var _UIfunctions = {};
                // VIDEO_SIGNAL
                _UIfunctions[Commands.VIDEO_SIGNAL.key + '_UPDATE'] = function (data) {
                    var port = _PortsByIndex[data.param].input.HDMI;
                    if (!port.selectedPort && _PortsByIndex[data.param].input.hasOwnProperty('HDBT')) {
                        port = _PortsByIndex[data.param].input.HDBT;
                    }
                    port.signal = (data.value == 1);
                };
                // X_SIGNAL
                _UIfunctions[Commands.X_SIGNAL.key + '_UPDATE'] = function (data) {
                    var port, signalType;
                    if (data.param.indexOf('.VIDEO.1') > -1) {
                        port = _PortsList[data.param.replace('.VIDEO.1', '')];
                        port.signal = port.videoSignal = (data.value == 1 || data.value == 'YES');

                    }
                    else if (data.param.indexOf('.AUDIO.1') > -1) {
                        port = _PortsList[data.param.replace('.AUDIO.1', '')];
                        port.audioSignal = (data.value == 1 || data.value == 'YES');
                    }
                };
                // VIDEO_PATTERN
                _UIfunctions[Commands.X_VIDEO_PATTERN.key + '_UPDATE'] = function (data) {
                    var port = _PortsList[data.param.replace('.VIDEO.1', '')];
                    if (port)
                        port[Commands.X_VIDEO_PATTERN.key] = data.value;
                };
                // VIDEO_PATTERN
                _UIfunctions[Commands.VIDEO_PATTERN.key + '_UPDATE'] = function (data) {
                    var port = _PortsList[data.param];
                    if (port)
                        port[Commands.VIDEO_PATTERN.key] = data.value;
                };
                // REMOTE_INFO
                _UIfunctions[Commands.REMOTE_INFO.key + '_UPDATE'] = function (data) {
                    var port = _PortsByIndex[data.param.portId][data.param.direction].HDMI || _PortsByIndex[data.param.portId][data.param.direction].HDBT;
                    if (!port.remoteDevice)
                        port.remoteDevice = data.value;
                    else
                        for (var prop in data.value) {
                            port.remoteDevice[prop] = data.value[prop]
                        }

                };
                if (Commands.PROG_ACTION)
                    _UIfunctions[Commands.PROG_ACTION.key + '_UPDATE'] = function (data) {
                        var port = _PortsByIndex[data.param.portId][data.param.direction].HDMI || _PortsByIndex[data.param.portId][data.param.direction].HDBT;
                        if (!port.remoteDevice)
                            port.remoteDevice = {};
                        port.remoteDevice.outputs = {}
                        port[Commands.PROG_ACTION.key] = data.value;
                        var binaryVal = data.value.toString(2)
                        for (var binaryPos = 0; binaryPos < binaryVal.length; binaryPos++) {
                            port.remoteDevice.outputs[binaryVal.length - 1 - binaryPos] = (binaryVal[binaryPos] == 1)
                        }
                    };
                // TUNNEL_CTRL
                _UIfunctions[Commands.TUNNEL_CTRL.key + '_UPDATE'] = function (data) {
                    console.log(data);
                };

                // X_PORT_SELECT
                _UIfunctions[Commands.X_PORT_SELECT.key + '_UPDATE'] = function (data) {
                    var portsToDisconnect = ConnectorsFactory.switchablePorts[data.param].group[ConnectorsFactory.switchablePorts[data.param].selected];
                    var portsToConnect = ConnectorsFactory.switchablePorts[data.param].group[data.value];

                    for (var i = 0; i < portsToDisconnect.length; i++) {
                        _PortsList[portsToDisconnect[i]].selectedPort = false;
                    }

                    for (var i = 0; i < portsToConnect.length; i++) {
                        _PortsList[portsToConnect[i]].selectedPort = true;
                    }

                    ConnectorsFactory.switchablePorts[data.param].selected = data.value;

                };
                // portLabel
                _UIfunctions[Commands.X_PORT_LABEL.key + '_UPDATE'] = function (data) {
                    var port = _MatrixPortsList.input[data.param];
                    if (port && angular.isDefined(data.value))
                        port.label = data.value;
                    //because sometimes port can be both output & input
                    port = _MatrixPortsList.output[data.param];
                    if (port && angular.isDefined(data.value))
                        port.label = data.value;
                };
                // AUTO_SWITCH
                _UIfunctions[Commands.AUTO_SWITCH.key + '_UPDATE'] = function (data) {
                    var param = data.param.split('.');
                    var port = _PortsList[param[0] + '.' + param[1] + '.' + param[2]];
                    port[Commands.AUTO_SWITCH.key] = data.value;
                };
                // SWITCH_PRIORITY
                _UIfunctions[Commands.SWITCH_PRIORITY.key + '_UPDATE'] = function (data) {
                    var port = _PortsList[data.param];
                    port[Commands.SWITCH_PRIORITY.key] = [];
                    for (var vs in data.value)
                        port[Commands.SWITCH_PRIORITY.key].push(data.value[vs].replace('.VIDEO.1', ''));
                };
                // SWITCH_PRIORITY_ALIAS
                _UIfunctions[Commands.SWITCH_PRIORITY_ALIAS.key + '_UPDATE'] = _UIfunctions[Commands.SWITCH_PRIORITY.key + '_UPDATE'];

                // DISPLAY
                _UIfunctions[Commands.DISPLAY.key + '_UPDATE'] = function (data) {
                    var port = _PortsByIndex[data.param].output.HDMI || _PortsByIndex[data.param].output.HDBT;
                    port.signal = (data.value == 1 || data.value == 2);
                };
                // AFV
                _UIfunctions[Commands.AFV.key + '_UPDATE'] = function (data) {
                    var port = _PortsList[data.param.replace('.VIDEO.1', '')];
                    port[Commands.AFV.key] = (data.value == 'ON') ? 1 : 0;
                };
                // AUDIO ONLY
                _UIfunctions[Commands.X_AUD_ONLY.key + '_UPDATE'] = function (data) {
                    var port = _PortsList[data.param.replace('.VIDEO.1', '')];
                    port[Commands.X_AUD_ONLY.key] = (data.value == 'ON') ? 1 : 0;
                };
                // HDCP_STAT
                _UIfunctions[Commands.HDCP_STAT.key + '_UPDATE'] = function (data) {
                    var io = data.param[0] == 0 ? 'input' : 'output';
                    var port = _PortsByIndex[data.param[1]][io].HDMI;
                    if (port)
                        port[Commands.HDCP_STAT.key] = data.value == 1;

                    port = _PortsByIndex[data.param[1]][io].HDBT;
                    if (port)
                        port[Commands.HDCP_STAT.key] = data.value == 1;
                };
                // HDCP_MOD
                _UIfunctions[Commands.HDCP_MOD.key + '_UPDATE'] = function (data) {
                    var port = _PortsByIndex[data.param].input.HDMI;
                    if (port)
                        port[Commands.HDCP_MOD.key] = (data.value == 1) || (data.value == 3);

                    port = _PortsByIndex[data.param].input.HDBT;
                    if (port)
                        port[Commands.HDCP_MOD.key] = (data.value == 1) || (data.value == 3);
                };
                // X_MIC_TYPE
                _UIfunctions[Commands.X_MIC_TYPE.key + '_UPDATE'] = function (data) {
                    var port = _PortsList[data.param];
                    port[Commands.X_MIC_TYPE.key] = (data.value == 'DYNAMIC' ? 1 : 0);
                };
                // X_LONG_REACH
                _UIfunctions[Commands.X_LONG_REACH.key + '_UPDATE'] = function (data) {
                    var port = _PortsList[data.param];
                    port[Commands.X_LONG_REACH.key] = (data.value == 'ON' ? 1 : 0);
                };
                // X_MUTE & X_BLANK
                _UIfunctions[Commands.X_MUTE.key + '_UPDATE'] = function (data) {
                    var port = null;
                    var signal = null;
                    if (data.param.indexOf('.VIDEO.1') > -1) {
                        port = _PortsList[data.param.replace('.VIDEO.1', '')];
                        signal = 'VIDEO';
                    }
                    if (data.param.indexOf('.AUDIO.1') > -1) {
                        port = _PortsList[data.param.replace('.AUDIO.1', '')];
                        signal = 'AUDIO';
                    }
                    if (!port[Commands.X_MUTE.key])
                        port[Commands.X_MUTE.key] = {};
                    port[Commands.X_MUTE.key][signal] = (data.value == 'ON');
                };

                // MUTE
                _UIfunctions[Commands.MUTE.key + '_UPDATE'] = function (data) {
                    var port = _PortsList[data.param];
                    if (port)
                        port[Commands.MUTE.key] = data.value;
                };

                // BRIGHTNESS
                _UIfunctions[Commands.BRIGHTNESS.key + '_UPDATE'] = function (data) {
                    var port = _PortsList[data.param];
                    if (port)
                        port[Commands.BRIGHTNESS.key] = parseInt(data.value);
                };

                // CONTRAST
                _UIfunctions[Commands.CONTRAST.key + '_UPDATE'] = function (data) {
                    var port = _PortsList[data.param];
                    if (port)
                        port[Commands.CONTRAST.key] = parseInt(data.value);
                };

                // W_SATURATION
                _UIfunctions[Commands.W_SATURATION.key + '_UPDATE'] = function (data) {
                    var port = _PortsList[data.param];
                    if (port)
                        port[Commands.W_SATURATION.key] = parseInt(data.value);
                };

                // AUD_SDI_SELECT
                _UIfunctions[Commands.AUD_SDI_SELECT.key + '_UPDATE'] = function (data) {
                    var port = _PortsList[data.param];
                    if (port)
                        port[Commands.AUD_SDI_SELECT.key] = data.value;
                };

                // AUD-SIG-TYPE
                _UIfunctions[Commands.AUD_SIG_TYPE.key + '_UPDATE'] = function (data) {
                    var port = _PortsList[data.param];
                    if (port)
                        port[Commands.AUD_SIG_TYPE.key] = data.value;
                };

                // VID_RES
                _UIfunctions[Commands.VID_RES.key + '_UPDATE'] = function (data) {
                    var port = _PortsList[data.param];
                    if (port)
                        port[Commands.VID_RES.key] = data.value;
                };

                // AUDIO_VOLUME
                _UIfunctions[Commands.AUDIO_VOLUME.key + '_UPDATE'] = function (data) {
                    var port = _PortsList[data.param.replace('.VIDEO.1', '')] || _PortsList[data.param.replace('.AUDIO.1', '')];
                    port[Commands.AUDIO_VOLUME.key] = data.value;
                };
                // AUDIO_RANGE
                _UIfunctions[Commands.X_AUDIO_RANGE.key + '_UPDATE'] = function (data) {
                    var port = _PortsList[data.param.replace('.AUDIO.1', '')];
                    port[Commands.X_AUDIO_RANGE.key] = {
                        "min": data.value[0],
                        "max": data.value[1]
                    };
                };
                // TIMEOUT
                _UIfunctions[Commands.AV_SW_TIMEOUT.key + '_UPDATE'] = function (data) {
                    console.log(data);
                    console.log(this.data);
                    // var port = _PortsList[data.param.replace('.VIDEO.1', '')] || _PortsList[data.param.replace('.AUDIO.1', '')];
                    // port[Commands.AUDIO_VOLUME.key] = data.value;
                };
                // GLOBAL_POE
                _UIfunctions[Commands.GLOBAL_POE.key + '_UPDATE'] = function (data) {
                    console.log(data);
                    console.log(this.data);
                };
                // X_POE
                _UIfunctions[Commands.X_POE.key + '_UPDATE'] = function (data) {
                    var port = _PortsList[data.param];
                    port.POE_Status = data.value.toUpperCase() == 'ON' ? true : false;
                };
                // X_POE_GROUPS
                _UIfunctions[Commands.X_POE_GROUPS.key + '_UPDATE'] = function (data) {
                    for (var selectedPort in data.value) {
                        var port = _PortsList[data.value[selectedPort]];
                        if (port)
                            port.POE_Status = true;
                    }
                };
                // X_FOLLOWERS_SW_MODE
                _UIfunctions[Commands.X_FOLLOWERS_SW_MODE.key + '_UPDATE'] = function (data) {
                    var port = _PortsList[data.param[0].replace('.VIDEO.1', '')] || _PortsList[data.param[0].replace('.AUDIO.1', '')];
                    // if(angular.isUndefined(port.followerMode[data.param[1]]))
                    port.followerMode[data.param[1]] = parseInt(data.value);
                };
                // X_5V
                if (Commands.X_5V)
                    _UIfunctions[Commands.X_5V.key + '_UPDATE'] = function (data) {
                        var port = _PortsList[data.param];
                        port[Commands.X_5V.key] = (data.value.toLowerCase() === 'on');
                    };

                // X_FOLLOWERS
                _UIfunctions[Commands.X_FOLLOWERS.key + '_UPDATE'] = function (data) {
                    var port = _PortsList[data.param.replace('.VIDEO.1', '')] || _PortsList[data.param.replace('.AUDIO.1', '')];
                    port[Commands.X_FOLLOWERS.key] = {};


                    for (var i = 0; i < data.value.length; i++) {
                        var parsed = data.value[i].split('.');
                        if (angular.isUndefined(port[Commands.X_FOLLOWERS.key][parsed[3]]))
                            port[Commands.X_FOLLOWERS.key][parsed[3]] = [];
                        port[Commands.X_FOLLOWERS.key][parsed[3]].push(parsed[0] + '.' + parsed[1] + '.' + parsed[2]);
                    }
                    for (var signal in port.followers) {
                        if (port[Commands.X_FOLLOWERS.key].hasOwnProperty(signal))
                            port.followers[signal].selected = port[Commands.X_FOLLOWERS.key][signal][0];
                        else if (port.followers[signal].selected && port.followers[signal].selected != "")
                            port.followers[signal].selected = null;

                    }
                };

                _UIfunctions[Commands.EDID_AUDIO.key + '_UPDATE'] = function (data) {
                    var port = _PortsByIndex[data.param].input.HDMI;
                    if (port)
                        port[Commands.EDID_AUDIO.key] = (data.value == 1);
                    port = _PortsByIndex[data.param].input.HDBT;
                    if (port)
                        port[Commands.EDID_AUDIO.key] = (data.value == 1);
                };
                _UIfunctions[Commands.EDID_CS.key + '_UPDATE'] = function (data) {
                    var port = _PortsByIndex[data.param].input.HDMI;
                    if (port)
                        port[Commands.EDID_CS.key] = (data.value == 0);
                    port = _PortsByIndex[data.param].input.HDBT;
                    if (port)
                        port[Commands.EDID_CS.key] = (data.value == 0);
                };
                _UIfunctions[Commands.PORTS_LIST.key + '_UPDATE'] = function (data) {
                    for (var port in data.value) {
                        var portData = data.value[port].split('.');
                        // port: port's name returned by device
                        //portData[1]: port's Type (i.e HDMI, HDBT ...)
                        // portData[2]:  port's index
                        this.addPort(data.value[port], portData[1], portData[2]);
                        if (portData[1] == 'RS232')
                            this.addPort(data.value[port], portData[1], portData[2], 'input');

                    }
                };
                _UIfunctions[Commands.X_PORT_SELECT.key + '_UPDATE'] = function (data) {
                    if (typeof  data.value === "object") {
                        for (var port in data.value) {
                            var selectedPort = data.value[port].selected;

                            for (var i = 0; i < data.value[port].group.length; i++) {
                                for (var j = 0; j < data.value[port].group[i].length; j++) {
                                    this.getMatrixPorts().input[data.value[port].group[i][j]].selectedPort = false;
                                    this.getMatrixPorts().input[data.value[port].group[i][j]].switchablePort = port;

                                }
                            }

                            for (var j = 0; j < data.value[port].group[selectedPort].length; j++) {
                                this.getMatrixPorts().input[data.value[port].group[selectedPort][j]].selectedPort = true;
                            }
                        }
                    }

                    //set followers - TODO: check if we should move it to kMatrix.js
                    for (var port in this.getPortsList()) {
                        if (this.getPortsList()[port].followers) { // && K_Port.getPortsList()[port].selectedPort
                            for (var signal in this.getPortsList()[port].followers) {
                                var portsContainsSignal = this.getPortByMasterSignal(signal);
                                angular.forEach(portsContainsSignal, function (currentPort) {
                                    if (currentPort.direction == this.getPortsList()[port].direction) {
                                        this.getPortsList()[port].followers[signal].list.push(currentPort);
                                    }
                                })
                            }
                        }
                    }
                };


                //     var deferred = $q.defer();
                //     var _self = this;
                //     this.__proto__.init()
                //         .then(function (data) {
                //             var test = _initPortsOverview();
                //             angular.extend(_self.viewModel.data, test)
                //             _self.__proto__.init().then(function(){
                //                 deferred.resolve(data);
                //
                //             })
                //         },null,function (res) {
                //             console.log("notify, ",res);
                //             return KramerDevice.send(res.cmd)
                //                 .then(function () {
                //                     res.promise.resolve(_modules[module].viewModel) ;
                //                 })
                //         });
                //     return deferred.promise;
                // },
                return {
                    updateViewModel: function (data) {
                        console.log("apply function for matrix");
                        this.updateUI({
                            cmd: data.cmd.key,
                            param: this.viewModel.data[data.cmd.key].param,
                            value: this.viewModel.data[data.cmd.key].value
                        })
                    },
                    setMatrixDescription: function (matrixDescriptor) {
                        _matrixDescriptor = matrixDescriptor
                    },
                    initMatrix: function () {
                        var _self = this;
                        if (_matrixDescriptor.hasOwnProperty('bothPortsDirection')) {
                            this.setPortDirection(function (port) {
                                var toInputsPort = _matrixDescriptor.bothPortsDirection.input;
                                var toOutputsPort = _matrixDescriptor.bothPortsDirection.output;

                                if (toInputsPort && toOutputsPort)
                                    if ((toInputsPort.indexOf(port) > -1 || port.indexOf('IN') > -1)
                                        && toOutputsPort.indexOf(port) == -1)
                                        return 'input';
                                    else
                                        return 'output';
                            });
                        }
                        else {
                            _self.setPortDirection(function (port) {
                                if (port.indexOf('IN') > -1) return 'input';
                                else return 'output';
                            })
                        }

                        if (_matrixDescriptor.hasOwnProperty('setFollowersPort'))
                            _self.setFollowersPort(function (port) {
                                return _matrixDescriptor.setFollowersPort(port)
                            })

                        _self.setPortsCommands(_matrixDescriptor.overviewDataToLoad, _matrixDescriptor.detailDataToLoad);
                       return _self.init()
                            .then(function (response) {
                                _initPortsOverview.call(_self);
                                console.log(response)


                            })

                    },
                    isDetailDataReady: function () {
                        return _detailIsReady
                    },
                    setPortDirection: function (portConfig) {
                        _portDirection = portConfig;
                    },
                    setConfigurablePort: function (portConfig) {
                        _ifPortConfigurable = portConfig;
                    },
                    setNoRoutes: function (noRouting) {
                        _noRouting = noRouting;
                    },
                    getNoRoutes: function (input, output) {
                        return _noRouting[input].indexOf(output) == -1;
                    },
                    setFollowersPort: function (portConfig) {
                        _ifPortHasFollowers = portConfig;
                    },
                    setPortsCommands: function (overviewCommands, detailsCommand, filters) {
                        // set filters
                        if (angular.isDefined(filters))
                            _PortCommands.filters = filters;

                        //set overview commands
                        if (angular.isDefined(overviewCommands)) {
                            if (angular.isDefined(overviewCommands.IN)) {
                                _PortCommands.overview.input = overviewCommands.IN;
                            }
                            if (angular.isDefined(overviewCommands.OUT)) {
                                _PortCommands.overview.output = overviewCommands.OUT;
                            }
                        }

                        //set details commands
                        if (angular.isDefined(detailsCommand)) {
                            if (angular.isDefined(detailsCommand.IN)) {
                                _PortCommands.detail.input = detailsCommand.IN;
                            }
                            if (angular.isDefined(detailsCommand.OUT)) {
                                _PortCommands.detail.output = detailsCommand.OUT;
                            }
                        }

                    },
                    getPortByIndex: function (index) {
                        return _PortsByIndex[index];
                    },
                    getPortByMasterSignal: function (signal) {
                        return _PortsByMasterSignal[signal];
                    },
                    getMatrixPorts: function () {
                        return _MatrixPortsList;
                    },
                    getPortsCommands: function () {
                        return _PortCommands;
                    },
                    getPortsList: function () {
                        // return object index by input & output
                        return _PortsList;
                    },
                    initPortsOverview: _initPortsOverview,
                    updateUI: function (data) {
                        if (angular.isDefined(_UIfunctions[data.cmd + '_UPDATE'])) {
                            _UIfunctions[data.cmd + '_UPDATE'].call(this, {
                                cmd: data,
                                param: data.param,
                                value: data.value
                            });
                        }
                    },
                    initPortsDetails: function () {
                        for (var id in _PortsList) {
                            var port = _PortsList[id];
                            if (angular.isDefined(_PortCommands.detail[port.direction]))
                                if (angular.isDefined(_PortCommands.detail[port.direction][port.portType]))
                                    _sendPortCommands.call(this, 'detail', port);
                        }
                        _detailIsReady = true;

                    },
                    updateDevice: function (port, cmd, value, additionalParam) {
                        var currentObj = this;

                        var dataToUpdate = {};
                        if (angular.isDefined(Commands[cmd].parserOnSend))
                            Commands[cmd].parserOnSend(port, value, additionalParam);
                        dataToUpdate[cmd] = value;
                        // return K_Proxy.updatePipe([Commands[cmd]]).then(function (data) {
                        //     for (var i = 0; i < data.length; i++) {
                        //         if (angular.isUndefined(data[i].errCode)) {
                        //             var parsedData;
                        //             if (angular.isDefined(data[i].cmd.parserOnMessage))
                        //                 parsedData = data[i].cmd.parserOnMessage(data[i].value);
                        //             if (parsedData) {
                        //                 currentObj.updateUI({
                        //                     cmd: data[i].cmd.key,
                        //                     param: parsedData.params,
                        //                     value: parsedData.value
                        //                 });
                        //             }
                        //         }
                        //         else {
                        //             console.log('ERROR WHILE UPDATING DATA');
                        //             $exceptionHandler(
                        //                 'Update Failed',
                        //                 {
                        //                     message: 'not all field have been saved, see the logs for info.\n Or contact your administrator',
                        //                     onClose: function () {
                        //                         angular.noop()
                        //                     }
                        //                 });
                        //         }
                        //     }
                        //     return $q.resolve(currentObj);
                        // }, function (err) {
                        //     console.log('ERROR WHILE FETCHING DATA');
                        //     return $q.reject(err);
                        // });

                    },
                    getPortsTypes: function () {
                        return _PortsTypes;
                    },
                    addPort: function (portId, type, index, direction, configurablePort, commands) {
                        if (!configurablePort && _ifPortConfigurable)
                            configurablePort = _ifPortConfigurable(portId);

                        if (!direction && _portDirection) {
                            direction = _portDirection(portId);
                        }
                        var portObj = new IO_port(portId, type, index, direction, configurablePort, commands);


                        if (_ifPortHasFollowers)
                            portObj.haveFollowers = _ifPortHasFollowers(portObj);

                        if (direction)
                            _MatrixPortsList[direction][portId] = portObj;

                        if (_PortsTypes.indexOf(type) === -1)
                            _PortsTypes.push(type);

                        _PortsList[portId] = portObj;

                        if (angular.isUndefined(_PortsByIndex[index]))
                            _PortsByIndex[index] = {};

                        if (angular.isUndefined(_PortsByIndex[index][direction]))
                            _PortsByIndex[index][direction] = {};

                        if (angular.isUndefined(_PortsByIndex[index][direction][type]))
                            _PortsByIndex[index][direction][type] = {};

                        if (angular.isUndefined(_PortsByMasterSignal[portObj.masterSignal]))
                            _PortsByMasterSignal[portObj.masterSignal] = [];

                        _PortsByMasterSignal[portObj.masterSignal].push(portObj);
                        if (portObj.masterSignal == 'VIDEO' && portObj.direction == 'input')
                            VideoService.pushToAutoSwitch(portObj);
                        _PortsByIndex[index][direction][type] = portObj;


                    },
                    doesMatrixHasSwitchablePorts: function () {
                        return _matrixHasSwitchablePorts;
                    },
                    autoSwitchOptions: [
                        {label: 'Manual', value: 0},
                        {label: 'Priority', value: 1},
                        {label: 'Last Connected', value: 2}],

                    updateFromInfoFile: function(matrixDescriptor){
                        _matrixDescriptor = matrixDescriptor;
                        // _setPortDirection();
                        // _setFollowers();

                    }
                }
            }])
})();
