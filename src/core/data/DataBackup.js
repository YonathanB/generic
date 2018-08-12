let _self;

export default class DataBackup {
    constructor() {
        _self = this;
    }

    store(toInsert) {
        if (!_self[toInsert.cmd.key])
            _self[toInsert.cmd.key] = {};

        // if(toInsert.cmd.hasOwnProperty('parserOnMessage')) {
        //     console.log('Call parser on message - context ', _self);
        //     // if()
        //
        //     _self[toInsert.cmd.key] = toInsert.value;
        //     toInsert.cmd.parserOnMessage.call(_self, toInsert);
        // }

        if (!toInsert.params)
            _self[toInsert.cmd.key] = toInsert.value;
        else
            _self[toInsert.cmd.key][toInsert.params] = toInsert.value;
        console.log(_self);


        if($('body'))//notify view
            setTimeout(function() {
                $('body').scope().$digest()
            }, 0);

    }

    createProperty(key) {
        this[key] = null;
    }

    valueExists(key) {
        return (this[key] !== undefined);
    }





}
