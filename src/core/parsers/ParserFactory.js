
import {P3K_Parser} from "./P3K_Parser";
import {Y_Parser} from "./Y_Parser";

let _protocols = { 'p3k' :P3K_Parser, 'y': Y_Parser };


class K_Parser {
    constructor() {
    }

    static decode (msg) {
        var protocol = _handledByProtocol(msg);
        if (protocol)
            return _protocols[protocol].decode(msg);
        else
            return {
                cmd: msg,
                errCode: 'Parsing error'
            };
    }
    static encode (obj, idx) {
        try {
            return _protocols[obj.type].encode(obj.set, obj.opCode, obj.value, obj.params, idx);
        } catch (e) {
            console.log('failed to send command to device', obj);
            if (e.title)
                throw e;
        }

    }

}

export {K_Parser};

function _handledByProtocol(msg){
    for (let type in _protocols) {
        if (_protocols[type].handledByProtocol(msg))
            return type;
    }
};