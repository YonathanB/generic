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
                    command.registerId = command.opCode;
                    if (angular.isArray(command.params)) {
                        value = value.split(',');
                        if (value[1] !== undefined) {
                            params = value.shift();
                            command.params = [params];
                            command.registerId += ' ' + command.params.join(',')
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
        return res;
    }
}

export{
    P3K_Parser
}











(function () {
    angular.module('core.parsers')
        .factory('P3K_Parser', ['Commands', function (Commands) {

            return {
                opCodePattern: /~0\d@([^ ][^ ?]+|\s)/,
                handledByProtocol: function (msg) {
                    var matches = msg.match(this.opCodePattern);
                    if (matches && angular.isDefined(Commands.commandsByOpCode[matches[1]]))
                        return matches && (Commands.commandsByOpCode[matches[1]].type === Commands.COMMAND_TYPE_P3000);
                    else
                        return false;
                },
                encode: function (write, commandOpCode, value, params, idx) {
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
                },
                T_Err_Suffix: /ERR *-?[0-9]+/,
                decode: function (msg) {
                    var res, value, params, command, matches;
                    var eom = msg.lastIndexOf(' OK');
                    if (eom === -1) {
                        eom = undefined;
                    }
                    matches = msg.match(this.opCodePattern);
                    command = Commands.commandsByOpCode[matches[1]];
                    if (command.key === 'RESTART' || command.key === 'FACTORY_RESET') {

                        return {
                            cmd: command,
                            type: Commands.RESTART
                        };
                    }
                    value = msg.substring(matches[0].length + 1, eom);//.replace('\n', '').replace(/[\n\r]/g, ''); // exclude the opCode and the OK


                    if (msg.match(this.T_Err_Suffix)) {
                        var errCode = msg.lastIndexOf('ERR') + 3;
                        var msgString = msg.substring(errCode);
                        if (angular.isArray(command.params) && angular.isDefined(command[value.split(' ')[0]])) {
                            value = value.split(' ');
                            command = command[value[0]];
                        }
                        res = {
                            cmd: command,
                            type: Commands.COMMAND_ERROR,
                            errCode: msgString,
                            params: value
                        }
                    } else {
                        try {
                            if (command) {
                                command.registerId = command.opCode;
                                if (angular.isArray(command.params)) {
                                    value = value.split(',');
                                    if (value[1] !== undefined) {
                                        params = value.shift();
                                        command.params = [params];
                                        command.registerId += ' ' + command.params.join(',')
                                    }
                                    value = value[0]
                                }
                                res = {
                                    type: Commands.COMMAND_TYPE_P3000,
                                    cmd: command,
                                    value: value,
                                    params: params
                                }
                            } else {
                                res = {
                                    type: Commands.COMMAND_WARNING,
                                    field: matches[1],
                                    value: value
                                };
                            }
                        } catch (e) {
                            console.log('TRANSLATOR SERVICE PARSER ERROR: ', e);
                        }
                    }
                    return res;
                }
            };
        }])
})();