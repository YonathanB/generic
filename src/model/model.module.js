import $core from "../core/core.module";
import $Kmodules from "../k-modules/model.module";


export default require('angular')
    .module('model', [$core, $Kmodules])
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