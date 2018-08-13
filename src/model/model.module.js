import $core from "../core/core.module";
import $Kmodules from "../k-modules/model.module";
import {applicationStarter} from "./applicationStarter";

export default require('angular')
    .module('model', [$core, $Kmodules])
    .service('MainService', ['ViewSettingsFactory',
        '$timeout', function(ViewSettingsFactory){
       return applicationStarter.start().then(function (infoFile) {
            ViewSettingsFactory.initMenu(infoFile.states, applicationStarter);
                document.getElementsByTagName("body")[0].style.display = 'block';
        });
    }])
    .name;

require('./ConnectorsFactory');
require('../k-modules/ModuleFactory');
require('./IO_ObjectService');
require('./K_Matrix');
require('./DeviceModuleFactory');