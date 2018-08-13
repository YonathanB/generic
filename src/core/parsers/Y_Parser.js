import {deviceCommands} from "../data/Commands";

let _Y_Prefix = /~01@Y/;
let _Y_Response_Prefix = /~01@Y [01],/;
let _Y_Err_Suffix = /ERR *-?[0-9]+/;


class Y_Parser {
    constructor() {
    }

    static handledByProtocol(msg) {
        return msg.match(_Y_Prefix) != null;
    }

    static encode(write, commandOpCode, params) {
        return "#Y " + (write ? '0,' : '1,') + commandOpCode + (angular.isArray(params) ? ',' + params[0] : '') + "\r";
    }

    static decode(msg) {
        var res;
        if (msg.match(this.Y_Err_Suffix)) {
            var errCode = msg.lastIndexOf('ERR') + 4;
            var msgString = msg.substring(errCode);
            res = {
                type: deviceCommands.COMMAND_ERROR,
                errCode: msgString
            }
        } else {
            if (msg.match(this.Y_Response_Prefix)) {
                var eom = msg.lastIndexOf(' OK');
                if (eom == -1) {
                    eom = undefined;
                }
                var msgString = msg.substring(8, eom).trim().replace(/[\n\r]/g, ''); // exclude the prefix and the OK
                var parts = msgString.split(',');
                var params = parts[1];//msgString.substring(parts[0].length);
                if (deviceCommands[parts[0]]) {
                    res = {
                        type: deviceCommands.COMMAND_TYPE_Y,
                        cmd: deviceCommands[parts[0]],
                        value: params
                    };
                }
                else {
                    return {
                        type: deviceCommands.COMMAND_WARNING,
                        field: parts[0],
                        value: params
                    };
                }
            }
        }
        return res;
    }
}

export{
    Y_Parser
}
