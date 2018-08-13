let _self;
let _onDataUpdated = [];
export default class DataBackup {
    constructor(onDataUpdated) {
        _self = this;
        _onDataUpdated.push(onDataUpdated);
    }

    store(toInsert) {
        if (!_self[toInsert.cmd.key])
            _self[toInsert.cmd.key] = {};

        if (!toInsert.params)
            _self[toInsert.cmd.key] = toInsert.value;
        else
            _self[toInsert.cmd.key][toInsert.params] = toInsert.value;

        for(let i = 0; i < _onDataUpdated.length; i++) {
            _onDataUpdated[i](_self);
        }

    }

    createProperty(key) {
        this[key] = null;
    }

    valueExists(key) {
        return (this[key] !== undefined);
    }





}
