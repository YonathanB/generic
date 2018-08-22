import {deviceCommands} from "../data/Commands";

let _dataProxy;



export default class DeviceModel {
    constructor(dataProxy = {}) {
        _dataProxy = dataProxy;
        this.data = {};
        this.actions = deviceActions;
    }
    setDataProxy(dataProxy){
        _dataProxy = dataProxy;
    }
    updateModel(updatedData, cmdField) {


        //notify view only if it's not an handshake
        // TODO - we can add a timeout to prevent digest loop every time on load
        if ($('body') && cmdField.cmd.key !== deviceCommands.HAND_SHAKE.key) {
            this.data = Object.assign(this.data, updatedData);
            setTimeout(function () {
                $('body').scope().$applyAsync()
            }, 0);
        }
    }
}


const deviceActions = {
    updateData: function(data){
        if(data.cmd.hasOwnProperty('parserOnSend')) {
            data.cmd.parserOnSend(data);
        } else data.cmd.value = data.value;

        console.log('updateData ', data);
        return _dataProxy.put([data.cmd]);

    },


    updateCredentials: function() {
        console.log('updateCredentials');
    },
    upgradeDevice: function(){
        console.log('upgradeDevice');
    },
    toggleSecurity: function(data){
        var toSend = deviceCommands.SECURITY_ENABLE;
        if(data && data.params) {
            toSend.params = [0];
            toSend.value = data.params.join(',');
        } else{
            toSend.value = 1;
            toSend.params = null;
        }
        return _dataProxy.put([toSend]);
    },
    factoryReset: function(){
        console.log('factoryReset');
    },
    restartDevice: function(){
        console.log('restartDevice');
    },
    updateMatrixRoute: function(){
        console.log('updateMatrixRoute');
    },
    loadConfig: function(){
        console.log('updateMatrixRoute');
    },
    saveConfig: function(){
        console.log('updateMatrixRoute');
    }

};

