let _self;

export default class DataBackup{
    constructor(){
        _self = this;
    }

    store(toInsert){
        if(!_self[toInsert.cmd.key])
            _self[toInsert.cmd.key] = {};
        if(!toInsert.params)
            _self[toInsert.cmd.key] = toInsert.value;
        else
            _self[toInsert.cmd.key][toInsert.params] = toInsert.value;

        if($('body'))//notify view
            $('body').scope().$digest()
    }
}



//
//
// (function () {
//     angular.module('core.data')
//         .factory("DataBackup", [
//             function () {
//                 var _model = {};
//
//                 var _store = function (msg) {
//                     _model[msg.cmd.key] = msg;
//                     console.log('BackUp: ', _model)
//                 };
//                 var _ifExist = function (cmd) {
//                     console.log('Check if command exist')
//                 };
//                 var _getValue = function (cmd) {
//                     console.log('Return value from backup')
//                 }
//
//                 return {
//                     store: _store,
//                     ifExist: _ifExist,
//                     getValue: _getValue
//                 };
//             }])
// })();