//
//  Contains the definition of all commands that are sent/received
//

import _ from 'underscore';

function Connectors() {
    var _ports = {
        HDBT: ['VIDEO', 'AUDIO', 'RS232', 'IR', 'USB'],
        HDMI: ['VIDEO', 'AUDIO'],
        IR: ['IR'],
        USB_A: ['USB'],
        USB_B: ['USB'],
        ANALOG_AUDIO: ['AUDIO'],
        MIC: ['AUDIO'],
        AMPLIFIED_AUDIO: ['AUDIO'],
        RS232: ['RS232']
    };

    var _signalsToPort = {
        'VIDEO': ['HDMI', 'HDBT', 'DVI', 'VGA'],
        'AUDIO': ['HDMI', 'HDBT', 'ANALOG_AUDIO', 'MIC', 'AMPLIFIED_AUDIO'],
        'IR': ['HDBT', 'IR'],
        'USB': ['HDBT', 'USB_A', 'USB_B'],
        'RS232': ['HDBT', 'RS232']
    };

    var _masterSignal = {
        HDBT: 'VIDEO',
        HDMI: 'VIDEO'
    };

    var _switchablePorts = [];

    return {
        ports: _ports,
        masterSignal: _masterSignal,
        switchablePorts: _switchablePorts,
        signalsToPort: _signalsToPort
    };
}

function CommandsFactory() {
    var commandsType = {
        COMMAND_TYPE_P3000: 'p3k',
        COMMAND_TYPE_Y: 'y',
        COMMAND_ERROR: 3,
        COMMAND_WARNING: 4,
        COMMAND_RESTART: 'RESTART'
    };
    var portsType = ['undefined ', 'DVI', 'HDMI', 'DisplayPort', 'HDBT', 'SDI', 'VGA', 'DGKat'];
    var extendedParser = function (msg) {
        if (angular.isDefined(msg)) {
            var parsedValue = msg.split(',');
            return {value: parsedValue[1], params: parsedValue[0]};
        }
    };
    var POE_Group = function(){
        this.inputs = [];
        this.outputs = [];
        this.selected = [];
    }
    var reconnect = function (msg) {
        console.log(msg);
        return {value: msg};
    };
    var Parser3 = function (msg) {
        var parsedValue = msg.split(',');
        return {value: parsedValue[2], params: [parsedValue[0], parsedValue[1]]};
    }
    var extendedListParser = function (msg) {
        if (angular.isDefined(msg)) {
            var segment = msg.replace('[', '').replace(']', '').split(',');
            var param = segment[0];
            param = param.split('.');
            segment.shift();
            return {value: segment, params: param[0] + '.' + param[1] + '.' + param[2]};
        }
    };

    var matrixRouteParser = function (route, jsonRoutes, isSwitcher) {
        var output_input = route.split(',');
        var output = output_input[0].split('.');
        var input = output_input[1].split('.');

        if (output[0] == 'IN' || input[0] == 'OUT') {
            input = output_input[0].split('.');
            output = output_input[1].split('.');
        }
        if (angular.isUndefined(jsonRoutes[output[0] + '.' + output[1] + '.' + output[2]]))
            jsonRoutes[output[0] + '.' + output[1] + '.' + output[2]] = {};
        if (angular.isUndefined(jsonRoutes[output[0] + '.' + output[1] + '.' + output[2]][output[3]]))
            jsonRoutes[output[0] + '.' + output[1] + '.' + output[2]][output[3]] = [];

        if (angular.isUndefined(jsonRoutes[input[0] + '.' + input[1] + '.' + input[2]]))
            jsonRoutes[input[0] + '.' + input[1] + '.' + input[2]] = {};
        if (!angular.isArray(jsonRoutes[input[0] + '.' + input[1] + '.' + input[2]][input[3]]))
            jsonRoutes[input[0] + '.' + input[1] + '.' + input[2]][input[3]] = [];


        jsonRoutes[input[0] + '.' + input[1] + '.' + input[2]][input[3]].push(output[0] + '.' + output[1] + '.' + output[2]);

        if (angular.isDefined(isSwitcher) && isSwitcher) //TODO check if we can remove it
            jsonRoutes[output[0] + '.' + output[1] + '.' + output[2]][output[3]][0] = input[0] + '.' + input[1] + '.' + input[2];
        else
            jsonRoutes[output[0] + '.' + output[1] + '.' + output[2]][output[3]].push(input[0] + '.' + input[1] + '.' + input[2]);
    };


    var getDateString = function (date) {
        date = new Date(date);
        //TIME
        var dday = date.getDate();
        var dmon = date.getMonth() + 1;
        var dyear = date.getFullYear();
        var ddate = dday + "-" + dmon + "-" + dyear + ' ' + date.getHours() + ':' + date.getMinutes();
        return ddate;
    };

    var commands = {
        ACTIVE_CLIENTS: {
            key: "ACTIVE_CLIENTS",
            name: "Active clients",
            opCode: 'KDS-ACTIVE-CLNT',
            type:commandsType.COMMAND_TYPE_P3000,
            
        },
        AFV: {
            key: 'AFV',
            name: 'Audio follow video',
            opCode: 'X-AFV',
            type: commandsType.COMMAND_TYPE_P3000,
            
            parserOnMessage: extendedParser,
            parserOnSend: function (port, value) {
                this.params = [];
                this.params.push(port.id + '.' + port.masterSignal + '.1');
                if (angular.isDefined(value))
                    this.value = value ? 'ON' : 'OFF';
            }
        },
        AUDIO_SRC_DEST: {
            key: "AUDIO_SRC_DEST",
            name: "Audio Source or destination",
            opCode: 'KDS-AUD',
            type:commandsType.COMMAND_TYPE_P3000,
            
            parserOnMessage: function (msgToParse) {
                return {value: parseInt(msgToParse)};
            }
        },
        AUDIO_VOLUME: {
            key: 'AUDIO_VOLUME',
            name: 'Audio volume',
            opCode: 'X-AUD-LVL',
            type: commandsType.COMMAND_TYPE_P3000,
            
            parserOnMessage: extendedParser,
            parserOnSend: function (port, value) {
                this.params = [];
                this.params.push(port.id + '.' + port.masterSignal + '.1');
                if (angular.isDefined(value))
                    this.value = value;
            }
        },
        AUD_SDI_SELECT: {
            key: 'AUD_SDI_SELECT',
            name: 'Select Audio Signal',
            opCode: 'AUD-SDI-SELECT',
            type: commandsType.COMMAND_TYPE_P3000,
            params: 2,
            parserOnMessage: function(msg){
                if (msg) {
                    var parsedValue = msg.replace(' ', '').split(',');
                    return {
                        value: {
                            group: parsedValue[2].trim(),
                            pair: parsedValue[3].trim()
                        },
                        params: parsedValue[1]
                    };
                }
            },
            parserOnSend: function (port, source) {
                this.params = [1, port.id];
                if (source) {
                    this.value = source.group + ',' + (source.pair ? source.pair : 0);
                }
            }
        },
        AUD_SIG_TYPE: {
            key: 'AUD_SIG_TYPE',
            name: 'Audio Signal Type',
            opCode: 'AUD-SIG-TYPE',
            type: commandsType.COMMAND_TYPE_P3000,
            params: 2,
            parserOnMessage: function(msg){
                if (msg) {
                    var parsedValue = msg.split(',');
                    return {
                        value: parsedValue[2].trim(),
                        params: parsedValue[1]
                    };
                }
            },
            parserOnSend: function (port, sigType) {
                this.params = [1, port.id];
                this.value = sigType
            }
        },
        AUTO_SWITCH: {
            key: 'AUTO_SWITCH',
            name: 'Auto switch',
            opCode: 'X-AV-SW-MODE',
            type: commandsType.COMMAND_TYPE_P3000,
            parserOnMessage: extendedParser,
            parserOnSend: function (port, value) {
                this.params = [];
                this.params.push(port.id + '.' + port.masterSignal + '.1');
                if (angular.isDefined(value))
                    this.value = value;
            },
            
        },
        AV_SW_TIMEOUT: {
            key: 'AV_SW_TIMEOUT',
            name: 'AV_SW_TIMEOUT',
            opCode: 'AV-SW-TIMEOUT',
            type: commandsType.COMMAND_TYPE_P3000,
            params: [],// possible values: '0', '1', '2', '4', '5', '6', '7'],
            parserOnSend: function (param, value) {
                this.params = [];
                this.params.push(param);
                if (angular.isDefined(value))
                    this.value = value ;
            }
        },


        BITRATE: {
            key: "BITRATE",
            name: "Bitrate",
            opCode: 'KDS-BR',
            type:commandsType.COMMAND_TYPE_P3000,
            
            parserOnMessage: function (msgToParse) {
                return {value: parseInt(msgToParse)};
            }
        },
        BRIGHTNESS: {
            key: 'BRIGHTNESS',
            name: 'Brightness',
            opCode: 'BRIGHTNESS',
            type: commandsType.COMMAND_TYPE_P3000,
            
            parserOnMessage: extendedParser,
            parserOnSend: function (port, brightness) {
                this.params = [port.id];
                this.value = brightness
            }
        },
        BUILD_DATE: {
            key: 'BUILD_DATE',
            name: 'BUILD-DATE',
            opCode: 'BUILD-DATE',
            type: commandsType.COMMAND_TYPE_P3000,
            
        },


        COM_ROUTE: {
            key: 'COM_ROUTE',
            name: 'Tunneling settings',
            opCode: 'COM-ROUTE',
            type: commandsType.COMMAND_TYPE_P3000,
            params: ['*', '1'],
            parserOnMessage: function (msgToParse) {
                if(msgToParse) {
                    var splitted_route_params = msgToParse.split(',');
                    var port_data = {};
                    port_data.com_num = splitted_route_params[0];
                    port_data.port_type = splitted_route_params[1];
                    port_data.port_number = parseInt(splitted_route_params[2]);
                    port_data.replies = splitted_route_params[3];
                    port_data.keep_alive_timing = parseInt(splitted_route_params[4]);
                    return {value: port_data};
                }
            },
            parserOnSend: function (toSend) {
                if (toSend.data[this.key]) {
                    this.value = toSend.data[this.key].port_type + "," +
                        toSend.data[this.key].port_number + "," +
                        toSend.data[this.key].replies + "," +
                        toSend.data[this.key].keep_alive_timing;
                }
            },
            "*": {
                key: 'COM_ROUTE',
                name: 'Tunneling settings all channels',
                parentKey: 'COM_ROUTE',
                opCode: 'COM-ROUTE',
                type: commandsType.COMMAND_TYPE_P3000,
                params: ['*'],
                parserOnMessage: function (msgToParse) {
                    if(msgToParse) {
                        var splitted_route_params = msgToParse.split(',');
                        var port_data = {};
                        port_data.com_num = splitted_route_params[0];
                        port_data.port_type = splitted_route_params[1];
                        port_data.port_number = parseInt(splitted_route_params[2]);
                        port_data.replies = splitted_route_params[3];
                        port_data.keep_alive_timing = parseInt(splitted_route_params[4]);
                        return {value: port_data};
                    }
                },
                parserOnSend: function (toSend) {
                    if (toSend.data[this.key]) {
                        this.value = toSend.data[this.key].port_type + "," +
                            toSend.data[this.key].port_number + "," +
                            toSend.data[this.key].replies + "," +
                            toSend.data[this.key].keep_alive_timing;
                    }
                }
            },
            "1": {
                key: 'COM_ROUTE',
                name: 'Tunneling settings channel 1',
                parentKey: 'COM_ROUTE',
                opCode: 'COM-ROUTE',
                type: commandsType.COMMAND_TYPE_P3000,
                params: ['1'],
                //getOnly: true,
                parserOnMessage: function (msgToParse) {
                    if(msgToParse) {
                        var splitted_route_params = msgToParse.split(',');
                        var port_data = {};
                        port_data.com_num = 1;
                        port_data.port_type = splitted_route_params[0];
                        port_data.port_number = parseInt(splitted_route_params[1]);
                        port_data.replies = splitted_route_params[2];
                        port_data.keep_alive_timing = parseInt(splitted_route_params[3]);
                        return {value: port_data};
                    }
                },
                parserOnSend: function (toSend, param) {
                    var key = this.key;
                    if(param) key += '_' + param.com_num
                    if (toSend.data[key]) {
                        this.value = toSend.data[key].port_type + "," +
                            toSend.data[key].port_number + "," +
                            toSend.data[key].replies + "," +
                            toSend.data[key].keep_alive_timing;
                    }
                }
            }
        },
        COM_ROUTE_ADD: {
            key: "COM_ROUTE_ADD",
            name: "Adding COM_ROUTE",
            opCode: 'COM-ROUTE-ADD',
            type:commandsType.COMMAND_TYPE_P3000,
            
        },
        COM_ROUTE_REMOVE: {
            key: "COM_ROUTE_REMOVE",
            name: "Removing COM_ROUTE",
            opCode: 'COM-ROUTE-REMOVE',
            type:commandsType.COMMAND_TYPE_P3000,
            
        },
        CONNECTION_PARAMS: {
            key: "CONNECTION_PARAMS",
            name: "Connection parameters",
            opCode: 'KDS-CONN',
            type:commandsType.COMMAND_TYPE_P3000,
            
            parserOnMessage: function (msgToParse) {
                if(msgToParse) {
                    var splitted_conn_params = msgToParse.split(',');
                    //var conn_data = new ConnectionSettings(splitted_conn_params[0],splitted_conn_params[1],splitted_conn_params[2]);
                    var conn_data = {}
                    conn_data.IP = splitted_conn_params[0];
                    conn_data.port = splitted_conn_params[1];
                    conn_data.folderName = splitted_conn_params[2];
                    //conn_data.toString = function(){}
                    return {value: conn_data};
                }
            }
        },
        CONTRAST: {
            key: 'CONTRAST',
            name: 'Contrast',
            opCode: 'CONTRAST',
            type: commandsType.COMMAND_TYPE_P3000,
            
            parserOnMessage: extendedParser,
            parserOnSend: function (port, contrast) {
                this.params = [port.id];
                this.value = contrast
            }
        },
        COPY_EDID: {
            key: 'EDID_COPY',
            name: 'COPY EDID',
            opCode: 'CPEDID',
            type: commandsType.COMMAND_TYPE_P3000,
            parserOnMessage: extendedParser,
            parserOnSend: function (port, value) {
                this.params = [];
                this.params.push(port.portIndex);
                if (angular.isDefined(value))
                    this.value = value ? 1 : 0;
            }
        }, // TODO rename it to EDID_COPY


        DISPLAY: {
            key: 'DISPLAY',
            name: 'Video Display',
            opCode: 'DISPLAY',
            getOnly: true,
            type: commandsType.COMMAND_TYPE_P3000,
            parserOnMessage: extendedParser,
            parserOnSend: function (port) {
                this.params = [];
                this.params.push(port.portIndex);
            },
            
        },


        EDID_AUDIO: {
            key: 'EDID_AUDIO',
            name: 'LPCM',
            opCode: 'EDID-AUDIO',
            type: commandsType.COMMAND_TYPE_P3000,
            parserOnMessage: extendedParser,
            parserOnSend: function (port, value) {
                this.params = [];
                // var stage = port.direction == 'IN' ? '1' : '0';
                this.params.push(port.portIndex);
                if (angular.isDefined(value))
                    this.value = value ? 1 : 0;
            }
        },
        EDID_CS: {
            key: 'EDID_CS',
            name: 'Force RGB',
            opCode: 'EDID-CS',
            type: commandsType.COMMAND_TYPE_P3000,
            parserOnMessage: extendedParser,
            parserOnSend: function (port, value) {
                this.params = [];
                // var stage = port.direction == 'IN' ? '1' : '0';
                this.params.push(port.portIndex);
                if (angular.isDefined(value))
                    this.value = value ? 0 : 4;
            }
        },
        EDID_DC: {
            key: 'EDID_DC',
            name: 'Force Deep Color',
            opCode: 'EDID-DC',
            type: commandsType.COMMAND_TYPE_P3000,
            parserOnMessage: extendedParser,
            parserOnSend: function (port, value) {
                this.params = [];
                // var stage = port.direction == 'IN' ? '1' : '0';
                this.params.push(port.portIndex);
                if (angular.isDefined(value))
                    this.value = value ? 1 : 0;
            }
        },
        EDID_LOCK: {
            key: 'EDID_LOCK',
            name: 'Lock edid',
            opCode: 'LOCK-EDID',
            type: commandsType.COMMAND_TYPE_P3000,
            parserOnMessage: extendedParser,
            parserOnSend: function (port, value) {
                this.params = [];
                // var stage = port.direction == 'IN' ? '1' : '0';
                this.params.push(port.portIndex);
                if (angular.isDefined(value))
                    this.value = value ? 1 : 0;
            }
        },
        ETH_PORT: {
            key: 'ETH_PORT',
            opCode: 'ETH-PORT',
            name: 'ETH port',
            type: commandsType.COMMAND_TYPE_P3000,
            params: [],
            parserOnSend: function (param, value) {
                this.params = [];
                // var stage = port.direction == 'IN' ? '1' : '0';
                this.params.push(param);
                if (angular.isDefined(value))
                    this.value = value ;
            }// todo don't forget that params can be either 0,1 and TCP, UDP
        },
        ETH_TUNNEL: {
            key: 'ETH_TUNNEL',
            name: 'Get an open tunnel parameters',
            opCode: 'ETH-TUNNEL',
            type: commandsType.COMMAND_TYPE_P3000,
            params: ['*'],
            parserOnMessage: function (msgToParse) {
                if(msgToParse) {
                    var splitted_tunnel_params = msgToParse.split(',');
                    var tunnel_data = {};
                    tunnel_data.commNum = splitted_tunnel_params[1];
                    tunnel_data.portType = splitted_tunnel_params[2];
                    tunnel_data.ETH_Port = parseInt(splitted_tunnel_params[3]);
                    tunnel_data.ETH_IP = splitted_tunnel_params[4];
                    tunnel_data.ETH_RepEn = splitted_tunnel_params[6];
                    tunnel_data.Wired = splitted_tunnel_params[7];
                    // var toReturn = {};
                    // toReturn[splitted_tunnel_params[0]] = tunnel_data
                    return {value: tunnel_data, params: splitted_tunnel_params[0]};
                }
                // }
            },
            '*':{
                key: 'ETH_TUNNEL',
                name: 'Get an open tunnel parameters',
                opCode: 'ETH-TUNNEL',
                type: commandsType.COMMAND_TYPE_P3000,
                params: ['*']

            }

        },



        FACTORY_RESET: {
            key: 'FACTORY_RESET',
            name: 'FACTORY',
            opCode: 'FACTORY',
            type: commandsType.COMMAND_TYPE_P3000,
            
        },
        FEATURE: {
            key: 'FEATURE',
            name: 'Streaming and recording feature',
            opCode: 'KDS-FEATURE',
            type: commandsType.COMMAND_TYPE_P3000,
            params: ['0', '1'],
            "0": {
                key: '0',
                name: 'Streaming feature',
                opCode: 'KDS-FEATURE',
                type: commandsType.COMMAND_TYPE_P3000,
                params: ['0']

            },
            "1": {
                key: '1',
                name: 'Recording feature',
                opCode: 'KDS-FEATURE',
                type: commandsType.COMMAND_TYPE_P3000,
                params: ['1']
            }
        },
        FEATURE_LIST: {
            key: 'FEATURE_LIST',
            name: 'FEATURE_LIST',
            opCode: 'FEATURE-LIST',
            type: commandsType.COMMAND_TYPE_P3000,
            params: [2],
            parserOnMessage: extendedParser
            // parserOnSend: function (port, value) {
            //     this.params = [];
            //     this.params.push(port.id + '.' + port.masterSignal + '.1');
            //     if (angular.isDefined(value))
            //         this.value = value;
            // },
        },
        FRAMERATE: {
            key: "FRAMERATE",
            name: "Framerate",
            opCode: 'KDS-FR',
            type:commandsType.COMMAND_TYPE_P3000,
            
            parserOnMessage: function (msgToParse) {
                return {value: parseInt(msgToParse)};
            }
        },



        GLOBAL_MUTE: {
            key: 'GLOBAL_MUTE',
            name: 'Global mute',
            opCode: 'GLOBAL-MUTE',
            parserOnMessage: function (value) {
                return {value: (value === 'ON' ? 1 : 0)};
            },
            type: commandsType.COMMAND_TYPE_P3000,
            
        },
        GLOBAL_POE: {
            key: 'GLOBAL_POE',
            name: 'GLOBAL_POE',
            opCode: 'GLOBAL-POE',
            type: commandsType.COMMAND_TYPE_P3000,
            
            parserOnSend: function (obj, value) {
                if (angular.isDefined(value))
                    this.value = (value == 1 ? 'ON' : 'OFF');
            },
            parserOnMessage: function (value) {
                return {value: (value === 'ON' ? 1 : 0)};
            }
        },
        GOP_SIZE: {
            key: "GOP_SIZE",
            name: "GOP Size",
            opCode: 'KDS-GOP',
            type:commandsType.COMMAND_TYPE_P3000,
            
            parserOnMessage: function (msgToParse) {
                return {value: parseInt(msgToParse)};
            }
        },
        HAND_SHAKE: {
            key: 'HAND_SHAKE',
            name: 'Test communication with device',
            opCode: ' ',
            type: commandsType.COMMAND_TYPE_P3000,
            
        },
        HDCP_MOD: {
            key: 'HDCP_MOD',
            name: 'HDCP',
            opCode: 'HDCP-MOD',
            type: commandsType.COMMAND_TYPE_P3000,
            
            parserOnMessage: extendedParser,
            parserOnSend: function (port, value) {
                this.params = [];
                this.params.push(port.portIndex);
                if (angular.isDefined(value))
                    this.value = value;
            }
        },
        HDCP_STAT: {
            key: 'HDCP_STAT',
            name: 'HDCP STAT',
            opCode: 'HDCP-STAT',
            getOnly: true,
            type: commandsType.COMMAND_TYPE_P3000,
            parserOnMessage: Parser3,
            parserOnSend: function (port, value) {
                this.params = [];
                //TODO help is wrong?
                var stage = port.direction == 'input' ? '0' : '1';
                this.params.push(stage + ',' + port.portIndex);
                if (angular.isDefined(value))
                    this.value = value;
            }
        },



        LATENCY: {
            key: "LATENCY",
            name: "Latency",
            opCode: 'KDS-LATENCY',
            type:commandsType.COMMAND_TYPE_P3000,
            
        },
        LOAD_EDID: { // todo rename to EDID_LOAD
            key: 'LOAD_EDID',
            name: 'LOAD EDID',
            opCode: 'LDEDID',
            type: commandsType.COMMAND_TYPE_P3000,
            parserOnMessage: extendedParser,
            parserOnSend: function (port, value) {
                this.params = [];
                this.params.push(port.portIndex);
                if (angular.isDefined(value))
                    this.value = value ? 1 : 0;
            }
        },
        LOCK_FP: {
            key: 'LOCK_FP ',
            name: 'Front panel',
            opCode: 'LOCK-FP',
            type: commandsType.COMMAND_TYPE_P3000,
            
            parserOnSend: function (obj, value) {
                if (angular.isDefined(value))
                    this.value = (value == 1 ? 'ON' : 'OFF');
            },
            parserOnMessage: function (value) {
                return {value: (value === 'ON' ? 1 : 0)};
            }
        },



        MATRIX_STATUS: {
            key: 'MATRIX_STATUS',
            name: 'matrixStatus',
            opCode: 'MATRIX-STATUS',
            getOnly: true,
            type: commandsType.COMMAND_TYPE_P3000,
            parserOnMessage: function (newUnParsedRoutes, jsonRoutes) {
                var routesArr = newUnParsedRoutes.replace('[[', '').replace(']]', '').split('],[');

                //reset existing routes
                for (var route in jsonRoutes)
                    delete jsonRoutes[route];


                for (var i = 0; i < routesArr.length; i++) {
                    try {
                        if(!jsonRoutes) jsonRoutes = {};
                        matrixRouteParser(routesArr[i], jsonRoutes)
                    } catch (e) {
                        console.log(e)
                    }
                }

                // reset retry
                this.retry = 0;
                return {value: jsonRoutes};
            },
            onError: function (currentRetry) {
                if (angular.isUndefined(this.retry) || this.retry > currentRetry)
                    this.retry = 0;
                this.retry++;
                return (currentRetry > this.retry);
            },

            
        },
        MODEL: {
            key: 'MODEL',
            name: 'model',
            opCode: 'MODEL',
            type: commandsType.COMMAND_TYPE_P3000,
            
        },
        MULTICAST_PARAMS: {
            key: "MULTICAST_PARAMS",
            name: "Multicast parameters",
            opCode: 'KDS-MULTICAST',
            type:commandsType.COMMAND_TYPE_P3000,
            
            parserOnMessage: function (msgToParse) {
                if(msgToParse) {
                    var splitted_multi_params = msgToParse.split(',');
                    var multicast_data = {};
                    multicast_data.address = splitted_multi_params[0];
                    multicast_data.time_to_live = splitted_multi_params[1];

                    return {value: multicast_data};
                }
            }
        },
        MUTE: {
            key: 'MUTE',
            name: 'Mute audio',
            opCode: 'MUTE',
            type: commandsType.COMMAND_TYPE_P3000,
            
            parserOnMessage: extendedParser,
            parserOnSend: function (port, isMute) {
                this.params = [port.id];
                this.value = isMute ? 1 : 0
            }
        },



        NAME: {
            key: 'NAME',
            name: 'name',
            opCode: 'NAME',
            type: commandsType.COMMAND_TYPE_P3000,
            
        },
        NET_CONFIG: {
            key: 'NET_CONFIG',
            name: 'NET CONFIG',
            opCode: 'NET-CONFIG',
            type: commandsType.COMMAND_TYPE_P3000,
            parserOnMessage: reconnect,
            
        },
        NET_DHCP: {
            key: 'NET_DHCP',
            name: 'DHCP',
            opCode: 'NET-DHCP',
            type: commandsType.COMMAND_TYPE_P3000,
            
        },
        NET_DNS: {
            key: 'NET_DNS',
            name: 'Primary and secondary DNS',
            opCode: 'NET-DNS',
            type: commandsType.COMMAND_TYPE_P3000,
            params: ['0', '1'],
            "0": {
                key: '0',
                name: 'Primary DNS',
                opCode: 'NET-DNS',
                type: commandsType.COMMAND_TYPE_P3000,
                params: ['0'],
                parserOnMessage: function (msgToParse) {
                    if (msgToParse) {
                        return {value: msgToParse};
                    }
                }
            },
            "1": {
                key: '1',
                name: 'Secondary DNS',
                opCode: 'NET-DNS',
                type: commandsType.COMMAND_TYPE_P3000,
                params: ['1'],
                parserOnMessage: function (msgToParse) {
                    if (msgToParse) {
                        return {value: msgToParse};
                    }
                }
            }
        },
        NET_GATE: {
            key: 'NET_GATE',
            name: 'NET-GATE',
            opCode: 'NET-GATE',
            type: commandsType.COMMAND_TYPE_P3000,
            
        },
        NET_IP: {
            key: 'NET_IP',
            name: 'NET-IP',
            opCode: 'NET-IP',
            type: commandsType.COMMAND_TYPE_P3000,
            parserOnMessage: reconnect,
            
        },
        NET_MAC: {
            key: 'NET_MAC',
            name: 'Mac address',
            opCode: 'NET-MAC',
            type: commandsType.COMMAND_TYPE_P3000,
            
        },
        NET_MASK: {
            key: 'NET_MASK',
            name: 'Mask address',
            opCode: 'NET-MASK',
            type: commandsType.COMMAND_TYPE_P3000,
            
        },



        PASSWORD: {
            key: 'PASSWORD',
            name: 'password',
            opCode: 'HTTP-PASSWD',
            type: commandsType.COMMAND_TYPE_P3000,
            
        },
        PORTS_LIST: {
            key: 'PORTS_LIST',
            name: 'portsList',
            opCode: 'PORTS-LIST',
            type: commandsType.COMMAND_TYPE_P3000,
            parserOnMessage: function (ports, selectedPorts) {
                var portObj = [];
                var splited = ports.replace('[', '').replace(']', '').split(',');
                for (var i = 0; i < splited.length; i++) {
                    portObj.push(splited[i]);
                }
                return {value: portObj};
            },
            
        },
        PROG_ACTION: {
            key: 'PROG_ACTION',
            name: 'Prog action',
            opCode: 'PROG-ACTION',
            type: commandsType.COMMAND_TYPE_P3000,
            parserOnMessage: function (msg) {
                if (msg) {
                    var splitedMsg = msg.split(',');
                    var parsedValue = parseInt(splitedMsg[3].split('0x')[1], 16);
                    var parsedParam = {
                        direction: (splitedMsg[0] == 0 ? 'input' : 'output'),
                        portId: splitedMsg[1],
                        button: splitedMsg[2]
                    };

                    return {value: parsedValue, params: parsedParam};
                }
            },
            parserOnSend: function (port, value) {
                this.params = [(port.direction == 'input' ? 0 : 1), port.portIndex, 1]

                if (typeof  value != undefined && value != null)
                    this.value = '0x' + value.toString(16);

            }

        },
        PROG_BTN_MOD: {
            key: 'PROG_BTN_MOD',
            name: 'Programmable buttons mode',
            opCode: 'PROG-BTN-MOD',
            type: commandsType.COMMAND_TYPE_P3000,
            
        },
        PRST_LIST: {
            key: 'PRST_LIST',
            name: 'Presets',
            opCode: 'PRST-LIST',
            parserOnSend: function () {
                console.log('PRST-LIST store')
            },
            parserOnMessage: function (msg) {
                var toReturn = [];
                var toReturnFormated = [];
                if (msg) {
                    var makeArrayPattern = /:(.*?)]/g;

                    var patterns = msg.match(makeArrayPattern);


                    for (var i = 0; i < patterns.length; i++) {
                        toReturn.push(patterns[i].replace(']', '').replace(':', ''));
                    }

                    for (var i = 0; i < toReturn.length; i++) {
                        var tmp = toReturn[i].split('.config:')
                        toReturnFormated[tmp[0].split('.')[1]] = {
                            label: tmp[0],
                            locked: tmp[1].toLowerCase() === 'on',
                            value: tmp[0].split('.')[1]
                        }
                    }
                }
                return {value: toReturnFormated};
            },
            type: commandsType.COMMAND_TYPE_P3000,
            
        },
        PRST_LOCK: {
            key: 'PRST_LOCK',
            name: 'lock preset',
            opCode: 'PRST-LOCK',
            type: commandsType.COMMAND_TYPE_P3000,
            parserOnSend: function (presetToStore) {
                this.params = [];
                this.params.push(presetToStore.id);

            },
            parserOnMessage: function (msg) {
                console.log(msg)
            }
        },
        PRST_RCL: {
            key: 'PRST_RCL',
            name: 'Recall preset',
            opCode: 'PRST-RCL',
            type: commandsType.COMMAND_TYPE_P3000,
            parserOnSend: function (presetToStore) {
                this.params = [];
                this.params.push(presetToStore.id);

            },
            parserOnMessage: function (msg) {
                console.log(msg)
            }
        },
        PRST_STO: {
            key: 'PRST_STO',
            name: 'Store preset',
            opCode: 'PRST-STO',
            type: commandsType.COMMAND_TYPE_P3000,
            parserOnSend: function (presetToStore) {
                this.params = [];
                this.params.push(presetToStore.id);

            },
            parserOnMessage: function (msg) {
                console.log(msg)
            }
        },



        RECORDING_STATUS: {
            key: "RECORDING_STATUS",
            name: "Recording status",
            opCode: 'KDS-RECORD-OP-STAT',
            type:commandsType.COMMAND_TYPE_P3000,
            
            parserOnMessage: function (msgToParse) {
                return {value: parseInt(msgToParse)};
            }
        },
        RECORD_DURATION: {
            key: "RECORD_DURATION",
            name: "Record duration time",
            opCode: 'KDS-RECORD-DURATION',
            type:commandsType.COMMAND_TYPE_P3000,
            
        },
        RECORD_SCHEDULE: {
            key: "RECORD_SCHEDULE",
            name: "Record schedule date and time",
            opCode: 'KDS-RECORD-SCHEDULE',
            type:commandsType.COMMAND_TYPE_P3000,
            
            parserOnMessage: function (msgToParse) {
                var record_data = {};
                if(msgToParse) {

                    var splitted_record_params = msgToParse.split(',');
                    var a_date = splitted_record_params[0].split("-");

                    record_data.date = new Date(a_date[2], parseInt(a_date[1]) - 1, a_date[0]);

                    record_data.time = splitted_record_params[1];

                    return {value: record_data};
                }
                else{
                    //record_data.date = new Date(2018, 1, 1);
                    record_data.time = "00:00:00";
                    return {value: record_data};
                }
            },
            parserOnSend: function (toSend) {
                if (toSend.data[this.key].date) {
                    if(typeof toSend.data[this.key].date == "string")
                        toSend.data[this.key].date = new Date(toSend.data[this.key].date)
                    var toArrDate = toSend.data[this.key].date.toDateString().split(' ');
                    var date = toArrDate[2] + "-" + (toSend.data[this.key].date.getMonth() + 1) + "-" + toArrDate[3];
                    var time = toSend.data[this.key].time;

                    this.value = date + "," + time;
                }
            }
            // parserOnSend: function (toSend) {
            //     toSend.data[this.key].date = $filter('date')(toSend.data[this.key].date, "dd-MM-yyyy");
            //     this.value = toSend.data[this.key].date + "," + toSend.data[this.key].time;
            // }
        },
        REMOTE_INFO: {
            key: 'REMOTE_INFO',
            name: 'Remote device info',
            opCode: 'REMOTE-INFO',
            type: commandsType.COMMAND_TYPE_P3000,
            
            parserOnMessage: function (msg) {
                if (msg) {
                    var splitedMsg = msg.split(',');
                    var portsInRemoteDevice = new Array(parseInt(splitedMsg[6]));
                    for (var i = 0; i < portsInRemoteDevice.length; i++) {
                        portsInRemoteDevice[i] = {
                            index: i + 1,
                            name: portsType[splitedMsg[i + 8]]
                        };
                    }
                    var parsedMsg = {
                        connected: splitedMsg[2] == 1,
                        device: splitedMsg[3],
                        current: splitedMsg[4],
                        stepIn: splitedMsg[5] == 0,
                        inputs: portsInRemoteDevice,
                        controls: splitedMsg[7]
                    };
                    var parsedParam = {
                        direction: (splitedMsg[0] == 0 ? 'input' : 'output'),
                        portId: splitedMsg[1]
                    };

                    return {value: parsedMsg, params: parsedParam};
                }
            },
            parserOnSend: function (port, toSend) {
                this.params = [];
                if (port.direction === 'input')
                    this.params.push("0");
                else
                    this.params.push("1");
                this.params.push(port.portIndex);
            }
        },
        RESTART: {
            key: 'RESTART',
            set: true,
            name: 'RESET',
            opCode: 'RESET',
            type: commandsType.COMMAND_TYPE_P3000,
            
        },



        SCALE_PARAMS: {
            key: "SCALE_PARAMS",
            name: "Scale",
            opCode: 'KDS-SCALE',
            type:commandsType.COMMAND_TYPE_P3000,
            
            parserOnMessage: function (msgToParse) {
                if(msgToParse) {
                    var splitted_conn_params = msgToParse.split(',');
                    var scale_data = {}
                    scale_data.mode = splitted_conn_params[0];
                    scale_data.resolution = splitted_conn_params[1];

                    return {value: scale_data};
                }
            }
        },
        SECURITY_ENABLE: {
            key: 'SECURITY_ENABLE',
            name: 'HTTP-AUTH-ENABLE',
            opCode: 'HTTP-AUTH-ENABLE',
            type: commandsType.COMMAND_TYPE_P3000,
            
        },
        SERVER_TIME: {
            key: 'SERVER_TIME',
            name: 'Use Time  Server (NTP)',
            opCode: 'TIME-SRV',
            type: commandsType.COMMAND_TYPE_P3000,
            
            parserOnMessage: function (msg) {
                var status = msg.split(',');
                var p_status = 0;
                if (status[3]) {
                    p_status = parseInt(status[3]);
                }
                return {
                    value: {
                        useTimeSrv: status[0],
                        ip: status[1],
                        sync: parseInt(status[2]),
                        status: p_status
                    }
                };
            },
            parserOnSend: function (toSend) {
                this.value = toSend.data[this.key].useTimeSrv + "," + toSend.data[this.key].ip + "," + toSend.data[this.key].sync;
            }
        },
        SN: {
            key: 'SN',
            name: 'Serial version',
            opCode: 'SN',
            type: commandsType.COMMAND_TYPE_P3000,
            
        },
        STORAGE_FILE_LIMIT: {
            key: "STORAGE_FILE_LIMIT",
            name: "Storage file limit",
            opCode: 'KDS-STORAGE-FILE-LIMIT',
            type:commandsType.COMMAND_TYPE_P3000,
            
            parserOnMessage: function (msgToParse) {
                if(msgToParse) {
                    var splitted_limit_time = msgToParse.split(':');

                    var limit_time_h = ("0" +splitted_limit_time[0]).slice(-2);
                    var limit_time_m = ("0" +splitted_limit_time[1]).slice(-2);
                    var limit_time_s = ("0" +splitted_limit_time[2]).slice(-2);

                    return {value: limit_time_h + ":" + limit_time_m + ":" + limit_time_s};
                }
            }
        },
        STORAGE_FILE_PREFIX: {
            key: "STORAGE_FILE_PREFIX",
            name: "Storage file prefix",
            opCode: 'KDS-STORAGE-FILE-PREFIX',
            type:commandsType.COMMAND_TYPE_P3000,
            
        },
        STORAGE_MAX_FILE: {
            key: "STORAGE_MAX_FILE",
            name: "Maximum number of files in storage",
            opCode: 'KDS-STORAGE-MAX-FILE',
            type:commandsType.COMMAND_TYPE_P3000,
            
        },
        STORAGE_PARAMS: {
            key: "STORAGE_PARAMS",
            name: "Storage parameters",
            opCode: 'KDS-STORAGE-MOUNT',
            type:commandsType.COMMAND_TYPE_P3000,
            
            parserOnMessage: function (msgToParse) {
                if(msgToParse) {
                    var splitted_storage_params = msgToParse.split(',');
                    var storage_data = {};
                    storage_data.uri = splitted_storage_params[0];
                    //storage_data.domain = splitted_storage_params[1];
                    storage_data.username = splitted_storage_params[1];
                    storage_data.password = "";

                    return {value: storage_data};
                }
            },
            parserOnSend: function (toSend) {
                if(toSend.data[this.key].uri && toSend.data[this.key].uri.toLowerCase().indexOf("usb:") > -1)
                {
                    this.value = toSend.data[this.key].uri;
                }
                else
                {
                    var password = toSend.data[this.key].password;
                    if(password != "")
                        password = '"' + "Basic " +  window.btoa(password) + '"';
                    this.value = toSend.data[this.key].uri + "," + toSend.data[this.key].username + "," + password;
                }

            }
        },
        STREAMER_ACTION: {
            key: "STREAMER_ACTION",
            name: "Streamer Action",
            opCode: 'KDS-ACTION',
            type:commandsType.COMMAND_TYPE_P3000,
            
        },
        STREAMER_ENCODING_METHOD: {
            key: "STREAMER_ENCODING_METHOD",
            name:"Streamer Encoding Method",
            opCode: 'KDS-EN',
            type:commandsType.COMMAND_TYPE_P3000,
            
            parserOnMessage: function (msgToParse) {
                return {value: parseInt(msgToParse)};
            }
        },
        STREAMER_WORKING_MODE: {
            key: "STREAMER_WORKING_MODE",
            name: "Streamer working mode",
            opCode: 'KDS-MOD',
            type:commandsType.COMMAND_TYPE_P3000,
            
            parserOnMessage: function (msgToParse) {
                return {value: parseInt(msgToParse)};
            }
        },
        STREAMING_METHOD: {
            key: "STREAMING_METHOD",
            name: "Streaming method",
            opCode: 'KDS-METHOD',
            type:commandsType.COMMAND_TYPE_P3000,
            
            parserOnMessage: function (msgToParse) {
                return {value: parseInt(msgToParse)};
            }
        },
        STREAMING_OPERATIONAL_STATUS: {
            key: "STREAMING_OPERATIONAL_STATUS",
            name: "Streaming Operational status",
            opCode: 'KDS-OP-STAT',
            type:commandsType.COMMAND_TYPE_P3000,
            
        },
        STREAMING_PROTOCOL: {
            key: "STREAMING_PROTOCOL",
            name: "Streaming protocol",
            opCode: 'KDS-PROT',
            type:commandsType.COMMAND_TYPE_P3000,
            
            parserOnMessage: function (msgToParse) {
                return {value: parseInt(msgToParse)};
            }
        },
        SWITCH_PRIORITY: {
            key: 'SWITCH_PRIORITY',
            name: 'Priority',
            opCode: 'X-PRIORITY',
            type: commandsType.COMMAND_TYPE_P3000,
            parserOnMessage: extendedListParser,
            parserOnSend: function (port, value) {
                this.params = [];
                var values = [];
                this.params.push(port.id + '.' + port.masterSignal + '.1');
                if (angular.isDefined(value))
                    for (var val in value)
                        values.push(value[val] + '.' + port.masterSignal + '.1');
                this.value = '[' + values.join(',') + ']';
            },
            
        },
        SWITCH_PRIORITY_ALIAS: {
            key: 'SWITCH_PRIORITY',
            name: 'Priority',
            opCode: 'X-MTX-SET-INPUTS',
            type: commandsType.COMMAND_TYPE_P3000,
            parserOnMessage: extendedListParser,
            parserOnSend: function (port, value) {
                this.params = [];
                var values = [];
                this.params.push(port.id + '.' + port.masterSignal + '.1');
                if (angular.isDefined(value))
                    for (var val in value)
                        values.push(value[val] + '.' + port.masterSignal + '.1');
                this.value = '[' + values.join(',') + ']';
            },
            
        },



        TIME: {
            key: 'TIME',
            name: 'Device date',
            opCode: 'TIME',
            type: commandsType.COMMAND_TYPE_P3000,
            
            parserOnMessage: function (msg) {
                var splittedTime = function(nonSplittedTime){
                    var a = nonSplittedTime.split(':');
                    return a[0]+':'+a[1];
                };
                var status = msg.split(',');
                var a_date = status[1].split("-");
                var p_date = new Date(a_date[2], parseInt(a_date[1]) - 1, a_date[0]);
                p_date.setHours(parseInt(status[2].split(':')[0]));
                p_date.setMinutes(parseInt(status[2].split(':')[1]));
                return {
                    value: {
                        day: status[0],
                        date: p_date,// getDateString(p_date),
                        time: splittedTime(status[2])
                    }
                };
            },
            parserOnSend: function (toSend) {
                if (toSend.data[this.key].date && toSend.data[this.key].date != 'Invalid Date') {
                    if(typeof toSend.data[this.key].date == "string")
                        toSend.data[this.key].date = new Date(toSend.data[this.key].date)
                    var toArrDate = toSend.data[this.key].date.toDateString().split(' ');
                    var date = toArrDate[2] + "-" + (toSend.data[this.key].date.getMonth() + 1) + "-" + toArrDate[3];
                    var time = toSend.data[this.key].time;

                    this.value = toArrDate[0] + "," + date + "," + time;
                }
            }
        },
        TIME_LOCATION: {
            key: 'TIME_LOCATION',
            name: 'Time zone',
            opCode: 'TIME-LOC',
            type: commandsType.COMMAND_TYPE_P3000,
            
            parserOnMessage: function (msg) {
                var parsedMsg = msg.split(',');
                return {value: {timeZone: parsedMsg[0], dayLight: parsedMsg[1]}};
            },
            parserOnSend: function (toSend) {
                this.value = toSend.data[this.key].timeZone + "," + toSend.data[this.key].dayLight;
            }
        },
        TUNNEL_CTRL: {
            key: 'TUNNEL_CTRL',
            name: 'Tunnel Controller',
            opCode: 'TUNNEL-CTRL',
            type: commandsType.COMMAND_TYPE_P3000,
            
            parserOnMessage: function (msg) {
                console.log(msg)
            },
            parserOnSend: function (port, toSend) {
                console.log('port', port);
                console.log('toSend', toSend);
            }
        },
        TIME_ZONE: {
            key: 'TIME_ZONE',
            name: 'Time zone',
            opCode: 'TIME-ZONE',
            type: commandsType.COMMAND_TYPE_P3000,
            
            parserOnMessage: function (msg) {
                var parsedMsg = (msg.replace(/^\s+/,"")).split(' ');
                return {value: parsedMsg[2].substring(0, parsedMsg[2].length-1) + " " + parsedMsg[0]};
            },
            parserOnSend: function (toSend) {
                if(toSend.data[this.key]) {
                    if(toSend.data[this.key] !== null && typeof toSend.data[this.key] !== 'object')
                    {
                        this.value = (toSend.data[this.key].split(' '))[1];
                    }
                    //this.value = toSend.data[this.key];
                    //this.value = (toSend.data[this.key].split(' '))[1];
                }

            }
        },
        TIME_ZONE_LIST: {
            key: 'TIME_ZONE_LIST',
            name: 'Time zone list',
            opCode: 'TIME-ZONE-LIST',
            type: commandsType.COMMAND_TYPE_P3000,
            
            parserOnMessage: function (msg) {
                var parsedMsg = msg.split('\n');
                return {value: parsedMsg};
            }
        },


        UART: {
            key: 'UART',
            name: 'UART settings',
            opCode: 'UART',
            type: commandsType.COMMAND_TYPE_P3000,
            params: ['1'],
            parserOnMessage: function (msgToParse) {
                if(msgToParse) {
                    var splitted_uart_params = msgToParse.split(',');
                    var uart_data = {};
                    uart_data.com_num = 1;
                    uart_data.baud_rate = parseInt(splitted_uart_params[0]);
                    uart_data.data_bits = parseInt(splitted_uart_params[1]);
                    uart_data.parity = parseInt(splitted_uart_params[2]);
                    uart_data.stop_bits = parseInt(splitted_uart_params[3]);
                    uart_data.serial_type = splitted_uart_params[4];
                    // uart_data.serial_485_item = splitted_uart_params[5];


                    return {value: uart_data};
                }
            },
            parserOnSend: function (toSend) {
                if(toSend.data[this.opCode]){
                    this.value = toSend.data[this.opCode].baud_rate + "," +
                        toSend.data[this.opCode].data_bits + "," +
                        toSend.data[this.opCode].parity + "," +
                        toSend.data[this.opCode].stop_bits;// + "," +
                    // toSend.data[this.opCode].serial_type + "," +
                    // toSend.data[this.opCode].serial_485_item;
                }

            },
            "1": {
                key: 'UART',
                name: 'UART settings',
                opCode: 'UART',
                type: commandsType.COMMAND_TYPE_P3000,
                params: ['1'],
                parserOnSend: function (toSend) {
                    var code = this.key +'_1';
                    if(toSend.data[code]){
                        this.value = toSend.data[code].baud_rate + "," +
                            toSend.data[code].data_bits + "," +
                            toSend.data[code].parity + "," +
                            toSend.data[code].stop_bits;// + "," +
                        // toSend.data[this.opCode].serial_type + "," +
                        // toSend.data[this.opCode].serial_485_item;
                    }

                }

            }
        },
        UPGRADE: {
            key: 'UPGRADE',
            name: 'UPGRADE',
            opCode: 'UPGRADE',
            type: commandsType.COMMAND_TYPE_P3000,
            
        },



        VERSION: {
            key: 'VERSION',
            name: 'Version',
            opCode: 'VERSION',
            type: commandsType.COMMAND_TYPE_P3000,
            
        },
        VIDEO_PATTERN: {
            key: 'VIDEO_PATTERN',
            name: 'Video Pattern',
            opCode: 'VID-PATTERN',
            type: commandsType.COMMAND_TYPE_P3000,
            params: [1],
            parserOnMessage: extendedParser,
            parserOnSend: function (port, pattern) {
                this.params = [port.id];
                this.value = pattern;
            }
        },
        VIDEO_PATTERN_LIST: {
            key: 'VIDEO_PATTERN_LIST',
            name: 'Pattern',
            opCode: 'X-PATTERNS-LIST',
            type: commandsType.COMMAND_TYPE_P3000,
            params: ['OUT.HDMI.1.VIDEO.1'],
            parserOnMessage: function (msg) {
                var toReturn = [];
                if (msg) {
                    var makeArrayPattern = /:(.*?)]/g;

                    var patterns = msg.match(makeArrayPattern);


                    for (var i = 0; i < patterns.length; i++) {
                        toReturn.push(patterns[i].replace(']', '').replace(':', ''));
                    }
                }
                return {value: toReturn};
            }
            // parserOnSend: function (port, value) {

        },
        VIDEO_SIGNAL: {
            key: 'VIDEO_SIGNAL',
            name: 'Video signal',
            opCode: 'SIGNAL',
            getOnly: true,
            type: commandsType.COMMAND_TYPE_P3000,
            parserOnMessage: extendedParser,
            parserOnSend: function (port) {
                this.params = [];
                this.params.push(port.portIndex);
                // var values = [];
                // if (angular.isDefined(value))
                //     for (var val in value)
                //         values.push(value[val].direction + '.' + value[val].portType + '.' + value[val].portIndex + '.' + value[val].masterSignal + '.1');
                // this.value = '['+values.join(',')+']';
            },
            
        },
        VID_RES: {
            key: 'VID_RES',
            name: 'Resolution',
            opCode: 'VID-RES',
            type: commandsType.COMMAND_TYPE_P3000,
            params: 2,
            parserOnMessage: function (msg) {
                if (msg) {
                    var parsedValue = msg.split(',');
                    return {
                        value: {
                            res: parsedValue[3].trim(),
                            native : parsedValue[2] ? 1 : 0
                        },
                        params: parsedValue[1]
                    };
                }
            },

            parserOnSend: function (port, resolution) {
                this.params = [1, port.id];
                if (resolution) {
                    var native =  parseInt(resolution.res) ? 0 : 1;
                    this.value = native + ',' + resolution.res;
                }
            }
        },



        W_SATURATION: {
            key: 'W_SATURATION',
            name: 'Saturation',
            opCode: 'W-SATURATION',
            type: commandsType.COMMAND_TYPE_P3000,
            
            parserOnMessage: extendedParser,
            parserOnSend: function (port, saturation) {
                this.params = [port.id];
                this.value = saturation
            }
        },



        X_5V: {
            key: 'X_5V',
            name: 'Five Volts',
            opCode: 'X-5V',
            type: commandsType.COMMAND_TYPE_P3000,
            
            getOnly: true,
            parserOnSend: function (port, value) {
                this.params = [];
                this.params.push(port.id);
                if (angular.isDefined(value))
                    this.value = (value == 1) ? 'ON' : 'OFF';
            },
            parserOnMessage: extendedParser
        },
        X_AUDIO_RANGE: {
            key: 'X_AUDIO_RANGE',
            name: 'Audio range',
            opCode: 'X-AUD-LVL-RANGE',
            getOnly: true,
            type: commandsType.COMMAND_TYPE_P3000,
            params: ['OUT.ANALOG_AUDIO.1.AUDIO.1'],
            parserOnMessage: extendedListParser,
            parserOnSend: function (port) {
                this.params = [];
                this.params.push(port.id + '.AUDIO.1');
            },
        },
        X_AUD_ONLY: {
            key: 'X_AUD_ONLY',
            name: 'Audio Only digital',
            opCode: 'X-AUD-ONLY',
            type: commandsType.COMMAND_TYPE_P3000,
            
            parserOnMessage: extendedParser,
            parserOnSend: function (port, value) {
                this.params = [];
                this.params.push(port.id);
                if (angular.isDefined(value))
                    this.value = (value == 1) ? 'ON' : 'OFF';
            }
        },
        X_FOLLOWERS: {
            key: 'X_FOLLOWERS',
            name: 'Followers',
            opCode: 'X-SET-FOLLOWERS',
            type: commandsType.COMMAND_TYPE_P3000,
            
            parserOnMessage: extendedListParser,
            parserOnSend: function (port, newValue) {
                this.params = [];
                this.params.push(port.id + '.' + port.masterSignal + '.1');
                var values = [];
                if (angular.isDefined(newValue)) {
                    for (var signal in newValue) {
                        if (!angular.isArray(newValue[signal]))
                            newValue[signal] = [newValue[signal]];
                        values.push(newValue[signal].join('.' + signal + '.1,') + '.' + signal + '.1');
                    }
                    this.value = '[' + values.join(',') + ']';
                }

            }
        },
        X_FOLLOWERS_SW_MODE: {
            key: 'X_FOLLOWERS_SW_MODE',
            name: 'Audio Follower',
            opCode: 'X-FOLLOWERS-SW-MODE',
            type: commandsType.COMMAND_TYPE_P3000,
            
            parserOnMessage: Parser3,
            parserOnSend: function (port, value) {
                this.params = [];
                this.params.push(port.id + '.' + port.masterSignal + '.1');
                this.params.push('AUDIO');
                if (angular.isDefined(value))
                    this.value = value;
            }
        },
        X_LONG_REACH: {
            key: 'X_LONG_REACH',
            name: 'X_LONG_REACH',
            opCode: 'X-LONG-REACH',
            type: commandsType.COMMAND_TYPE_P3000,
            args: 1,
            params: null,
            parserOnMessage: extendedParser,
            parserOnSend: function (port, value) {
                if (port.portType == 'HDBT') {
                    this.params = [];
                    this.params.push(port.id);
                    if (angular.isDefined(value))
                        this.value = (value == 1 ? 'ON' : 'OFF');
                }
            }
        },
        X_MIC_TYPE: {
            key: 'X_MIC_TYPE',
            name: 'X_MIC_TYPE',
            opCode: 'X-MIC-TYPE',
            type: commandsType.COMMAND_TYPE_P3000,
            getOnly: true,
            args: 1,
            params: null,
            parserOnMessage: extendedParser,
            parserOnSend: function (port, value) {
                if (port.portType == 'MIC') {
                    this.params = [];
                    this.params.push(port.id);
                    if (angular.isDefined(value))
                        this.value = (value == 1 ? 'DYNAMIC' : 'CONDENSER');
                }
            }
        },
        X_MUTE: {
            key: 'X_MUTE',
            name: 'Mute',
            opCode: 'X-MUTE',
            type: commandsType.COMMAND_TYPE_P3000,
            
            parserOnMessage: extendedParser,
            parserOnSend: function (port, value, additionalParam) {
                this.params = [];
                this.params.push(port.id + '.' + (additionalParam ? additionalParam : port.masterSignal) + '.1');
                if (angular.isDefined(value))
                    this.value = value ? 'ON' : 'OFF';
            }
        },
        X_PORT_LABEL: {
            key: 'X_PORT_LABEL',
            name: 'label',
            opCode: 'X-LABEL',
            type: commandsType.COMMAND_TYPE_P3000,
            
            parserOnMessage: extendedParser,
            parserOnSend: function (port, value) {
                this.params = [];
                this.params.push(port.id);
                if (angular.isDefined(value))
                    this.value = value;
            }
        },
        X_POE: {
            key: 'X_POE',
            name: 'POE for port',
            opCode: 'X-POE',
            type: commandsType.COMMAND_TYPE_P3000,
            
            parserOnMessage: extendedParser,
            parserOnSend: function (port, value) {
                this.params = [];
                this.params.push(port.id);
                if (angular.isDefined(value))
                    this.value = value ? 'ON' : 'OFF';
            }
        },
        X_POE_GROUPS: {
            key: 'X_POE_GROUPS',
            name: 'POE groups',
            opCode: 'X-POE-GROUPS',
            type: commandsType.COMMAND_TYPE_P3000,
            
            parserOnMessage: function (msg) {
                var toReturn = [];
                var poeLine = msg.replace('[[', '').replace(']]', '').split('],[');

                for (var i = 0; i < poeLine.length; i++) {
                    var hdbtPorts = poeLine[i].split(',');
                    toReturn.push(new POE_Group());
                    for (var port in hdbtPorts) {
                        var tmp = hdbtPorts[port].split(':');
                        var portId = tmp[0].replace('[', '').replace(']', '').toUpperCase().trim();
                        var isPOE = tmp[1].replace('[', '').replace(']', '').toUpperCase().trim() == 'ON' ? true : false;
                        if (portId.indexOf('IN') > -1)
                            toReturn[i].inputs.push(portId);
                        else
                            toReturn[i].outputs.push(portId);
                        if (isPOE)
                            toReturn[i].selected.push(portId);
                    }

                }

                return {value: toReturn};
            },
            parserOnSend: function (port, value) {
                console.log("sending POE GROUP")
            }
        },
        X_PORT_SELECT: {
            key: 'X_PORT_SELECT',
            name: 'selectedPort',
            opCode: 'X-PORT-SELECT',
            type: commandsType.COMMAND_TYPE_P3000,
            parserOnMessage: function (msg) {
                msg = msg.split(',[')[0].split(',');
                return {value: msg[1], params: msg[0]};
            },
            parserOnSend: function (port, value) {
                if (value) {
                    this.value = ConnectorsService.switchablePorts[port.switchablePort].options.indexOf(value);
                    this.params = [port.switchablePort];
                }
            },
            
        },
        X_PORT_SELECT_LIST: {
            key: 'X_PORT_SELECT_LIST',
            name: 'selectedPort',
            opCode: 'X-PORT-SELECT-LIST',
            type: commandsType.COMMAND_TYPE_P3000,
            parserOnMessage: function (ports) {
                if (ports.length > 10) {
                    // var selectablePorts = {"inputs": {}, "outputs": {}};

                    var makeArrayPattern = /\w+(.*?]])/g;
                    var selectablePortsString = ports.match(makeArrayPattern);

                    var keyPattern = /(.*?),/;
                    var selectedPattern = /,(\d),/;
                    var selectionPattern = /:\[(.*?)]/g;


                    var toReturn = {};
                    for (var i = 0; i < selectablePortsString.length; i++) {
                        var key = selectablePortsString[i].match(keyPattern)[1];
                        toReturn[key] = {
                            "group": selectablePortsString[i].match(selectionPattern),
                            "selected": selectablePortsString[i].match(selectedPattern)[1],
                            "options": []
                        };
                        for (var j = 0; j < toReturn[key].group.length; j++) {
                            toReturn[key].group[j] = toReturn[key].group[j].replace(':[', '').replace(']', '').split(','); // remove unwanted charcaters gets from regex
                            toReturn[key].options.push(toReturn[key].group[j].join(','));
                        }
                    }
                    return {value: toReturn};
                }
                else
                    return {value: ports};
            },
            parserOnSend: function (port, value) {
                if (port && value) {
                    if (angular.isDefined(port))
                        this.value = value;
                }
            },
            
        },
        X_SET_ROUTE: {
            key: 'X_SET_ROUTE',
            name: 'xRoute',
            opCode: 'X-ROUTE',
            isSetOnly: true,
            type: commandsType.COMMAND_TYPE_P3000,
            parserOnMessage: function (newRoute, existingRoutes, isSwitcher) {
                if (angular.isUndefined(existingRoutes))
                    existingRoutes = {};
                matrixRouteParser(newRoute, existingRoutes, isSwitcher);
                return {value: existingRoutes};
            },
            params: [],
            args: 1
        },
        X_SIGNAL: {
            key: 'X_SIGNAL',
            name: 'Signal',
            opCode: 'X-SIGNAL',opCode: 'X-SIGNAL',
            type: commandsType.COMMAND_TYPE_P3000,
            
            parserOnMessage: extendedParser,
            parserOnSend: function (port, value, additionalParam) {
                this.params = [];
                this.params.push(port.id + '.' + (additionalParam ? additionalParam : port.masterSignal) + '.1');
                if (angular.isDefined(value))
                    this.value = value;
            }
        },
        X_VIDEO_PATTERN: {
            key: 'X_VIDEO_PATTERN',
            name: 'Pattern',
            opCode: 'X-PATTERN',
            type: commandsType.COMMAND_TYPE_P3000,
            
            parserOnMessage: extendedParser,
            parserOnSend: function (port, value) {
                this.params = [];
                this.params.push(port.id + '.' + port.masterSignal + '.1');
                if (angular.isDefined(value))
                    this.value = value;
            }
        }
    };
    var commandsByOpCode = {};
    _.each(commands, function (command) {
        commandsByOpCode[command.opCode] = command;
        // this.commandsByType[command.type][command.opCode] = command;
        // this.commandsByName[command.name] = command;
    }, commands);

    var commandObj = angular.extend({}, commandsType, commands);
    commandObj.commandsByOpCode = commandsByOpCode;

    return commandObj;
}

let deviceCommands = new CommandsFactory();

export {
    Connectors,
    CommandsFactory,
    deviceCommands
}

