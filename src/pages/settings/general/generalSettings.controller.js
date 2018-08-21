import {deviceCommands} from "../../../core/data/Commands";
import AbstractPageCtrl from '../../abstractPage.controller'

// let $ctrl = this;




let _generalProperties = {
    'deviceName': deviceCommands.NAME.key,
    'deviceModel': deviceCommands.MODEL.key,
    'firmwareVersion': deviceCommands.VERSION.key,
    'isAuthenticationEnabled': deviceCommands.SECURITY_ENABLE.key
};

export default class GeneralDeviceSettingsCtrl extends AbstractPageCtrl{
    constructor($scope) {
        super($scope, _generalProperties);
        let $ctrl = this;

        $ctrl.update = function(toUpdate) {
            console.log(toUpdate, $ctrl.vm[toUpdate[0]]);
        }
    }
}