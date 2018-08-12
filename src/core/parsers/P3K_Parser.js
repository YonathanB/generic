import {deviceCommands} from "../data/Commands";

let _opCodePattern = /~0\d@([^ ][^ ?]+|\s)/;
let _T_Err_Suffix = /ERR *-?[0-9]+/;

class P3K_Parser{
    constructor(){}
    static handledByProtocol (msg) {
        var matches = msg.match(_opCodePattern);
        if (matches && angular.isDefined(deviceCommands.commandsByOpCode[matches[1]]))
            return matches && (deviceCommands.commandsByOpCode[matches[1]].type === deviceCommands.COMMAND_TYPE_P3000);
        else
            return false;
    }
    static encode (write, commandOpCode, value, params, idx) {
        if (value && typeof value === 'string') {
            if (value.indexOf('#') > -1 || value.indexOf('@') > -1) {
                throw ({
                    title: "Update Failed",
                    message: "<p>Please make sure you don't use the special characters <b>#</b> or <b>@</b>.",
                    cause: "Protocol Error"
                });
            }
        }
        var commandId = '';
        if (idx)
            commandId = '0' + idx + '@';
        var res = '#' + commandId + commandOpCode;
        if (write) {
            if (angular.isArray(params))
                res += ' ' + params.join(',') + ',';

            if (angular.isArray(value))
                res += '[' + value.join(',') + ']';
            else {
                var last = res[res.length - 1];
                if (last != ' ' && last != ',') {
                    res += ' '
                }
                if(value)
                    res += value.toString();
            }
        }
        else {
            if (commandOpCode.trim())// don't append ? on handshake command
                res += '? ';
            if (angular.isArray(params))
                res += params.join(',');
        }
        return res + '\r';
    }
    static decode(msg) {
        var res, value, params, command, matches;
        var eom = msg.lastIndexOf(' OK');
        if (eom === -1) {
            eom = undefined;
        }
        matches = msg.match(_opCodePattern);
        command = deviceCommands.commandsByOpCode[matches[1]];
        if (command.key === 'RESTART' || command.key === 'FACTORY_RESET') {

            return {
                cmd: command,
                type: deviceCommands.RESTART
            };
        }
        value = msg.substring(matches[0].length + 1, eom);//.replace('\n', '').replace(/[\n\r]/g, ''); // exclude the opCode and the OK


        if (msg.match(_T_Err_Suffix)) {
            var errCode = msg.lastIndexOf('ERR') + 3;
            var msgString = msg.substring(errCode);
            if (angular.isArray(command.params) && angular.isDefined(command[value.split(' ')[0]])) {
                value = value.split(' ');
                command = command[value[0]];
            }
            res = {
                cmd: command,
                type: deviceCommands.COMMAND_ERROR,
                errCode: msgString,
                params: value
            }
        } else {
            try {
                if (command) {
                    if (angular.isArray(command.params)) {
                        value = value.split(',');
                        if (value[1] !== undefined) {
                            params = value.shift();
                            command.params = [params];
                        }
                        value = value[0]
                    }
                    res = {
                        type: deviceCommands.COMMAND_TYPE_P3000,
                        cmd: command,
                        value: value,
                        params: params
                    }
                } else {
                    res = {
                        type: deviceCommands.COMMAND_WARNING,
                        field: matches[1],
                        value: value
                    };
                }
            } catch (e) {
                console.log('TRANSLATOR SERVICE PARSER ERROR: ', e);
            }
        }
        return valueParser(res);




    }

}

export{
    P3K_Parser
}




function valueParser(obj){

    switch (obj.cmd.key) {
        case deviceCommands.BITRATE.key:
        case deviceCommands.FRAMERATE.key:
        case deviceCommands.AUDIO_SRC_DEST.key:
        case deviceCommands.STREAMING_PROTOCOL.key:
        case deviceCommands.STREAMER_ENCODING_METHOD.key:
        case deviceCommands.STREAMING_METHOD.key:
        case deviceCommands.STREAMER_WORKING_MODE.key:
        case deviceCommands.RECORDING_STATUS.key:
        case deviceCommands.GOP_SIZE.key:
            obj.value = parseInt(obj.value);
            break;

        case deviceCommands.GLOBAL_MUTE.key:
        case deviceCommands.GLOBAL_POE.key:
        case deviceCommands.LOCK_FP.key:
            obj.value = (obj.value === 'ON' ? 1 : 0);
            break;

        case deviceCommands.MATRIX_STATUS.key:
            const matches = obj.value.match(/[\w\.\d]+/gi);
            obj.value = {};
            for(var i = 0; i< matches.length; i+=2) {
                obj.value[matches[i]] = matches[i+1];
            }
            break;
        case deviceCommands.PORTS_LIST.key:
            var portObj = [];
            var splited = obj.value.replace('[', '').replace(']', '').split(',');
            for (var i = 0; i < splited.length; i++) {
                portObj.push(splited[i]);
            }
            obj.value = portObj;
            break;
        case deviceCommands.X_PORT_SELECT.key:
            break;
        case deviceCommands.X_PORT_SELECT_LIST.key:
            var makeArrayPattern = /\w+(.*?]])/g;
            var selectablePortsString = obj.value.match(makeArrayPattern);

            var keyPattern = /(.*?),/;
            var selectedPattern = /,(\d),/;
            var selectionPattern = /:\[(.*?)]/g;


            var toReturn = {};
            for (var i = 0; i < selectablePortsString.length; i++) {
                var key = selectablePortsString[i].match(keyPattern)[1];
                toReturn[key] = {
                    "group": selectablePortsString[i].match(selectionPattern),
                    "selected": parseInt(selectablePortsString[i].match(selectedPattern)[1]),
                    "options": []
                };
                for (var j = 0; j < toReturn[key].group.length; j++) {
                    toReturn[key].group[j] = toReturn[key].group[j].replace(':[', '').replace(']', '').split(','); // remove unwanted charcaters gets from regex
                    toReturn[key].options.push(toReturn[key].group[j].join(','));
                }
            }
            obj.value = toReturn;
            break;
        case deviceCommands.X_SET_ROUTE.key:
            break;
        case deviceCommands.X_SIGNAL.key:
            break;
        case deviceCommands.X_VIDEO_PATTERN.key:
            break;

        case deviceCommands.PROG_ACTION.key:
            break;
        case deviceCommands.PRST_LIST.key:
            break;
        case deviceCommands.RECORD_SCHEDULE.key:
            break;
        case deviceCommands.REMOTE_INFO.key:
            break;
        case deviceCommands.SCALE_PARAMS.key:
            break;
        case deviceCommands.SERVER_TIME.key:
            break;
        case deviceCommands.STORAGE_FILE_LIMIT.key:
            break;
        case deviceCommands.STORAGE_PARAMS.key:
            break;
        case deviceCommands.SWITCH_PRIORITY.key:
            break;
        case deviceCommands.SWITCH_PRIORITY_ALIAS.key:
            break;
        case deviceCommands.TIME.key:
            break;
        case deviceCommands.TIME_LOCATION.key:
            break;
        case deviceCommands.TIME_ZONE.key:
            break;
        case deviceCommands.TIME_ZONE_LIST.key:
            break;
        case deviceCommands.UART.key:
            break;
        case deviceCommands.VIDEO_PATTERN.key:
            break;
        case deviceCommands.VIDEO_PATTERN_LIST.key:
            break;
        case deviceCommands.VID_RES.key:
            break;
        case deviceCommands.W_SATURATION.key:
            break;
        case deviceCommands.X_5V.key:
            break;
        case deviceCommands.X_AUDIO_RANGE.key:
            break;
        case deviceCommands.X_AUD_ONLY.key:
            break;
        case deviceCommands.X_FOLLOWERS.key:
            break;
        case deviceCommands.X_FOLLOWERS_SW_MODE.key:
            break;
        case deviceCommands.X_LONG_REACH.key:
            break;
        case deviceCommands.X_MIC_TYPE.key:
            break;
        case deviceCommands.X_MUTE.key:
            break;
        case deviceCommands.X_PORT_LABEL.key:
            break;
        case deviceCommands.X_POE.key:
            break;
    }

    function onOffConverter(value){

    }
    return obj;
}