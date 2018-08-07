import $core from "../core/core.module";
import $Kmodules from "../k-modules/model.module";
import {deviceModel} from "./DeviceModel";

export default require('angular')
    .module('model', [$core, $Kmodules])
    .service('MainService', ['ViewSettingsFactory',
        '$timeout', function(ViewSettingsFactory){
       return deviceModel.start().then(function (infoFile) {
            ViewSettingsFactory.initMenu(infoFile.states, deviceModel);
                document.getElementsByTagName("body")[0].style.display = 'block';
        });
    }])
    .name;

// require('./DeviceModel');
require('./ConnectorsFactory');
require('../k-modules/ModuleFactory');
require('./IO_ObjectService');
// require('./Matrix');
require('./K_Matrix');
require('./DeviceModuleFactory');
// require('../../GlobalScripts/utils');
// require('./Commands');
// require('./MessageService');