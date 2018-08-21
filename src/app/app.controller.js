import AbstractPageCtrl from "../pages/abstractPage.controller";
import {deviceCommands} from "../core/data/Commands";


let _appProperties = {
    'deviceModel': deviceCommands.MODEL.key,
    'isAuthenticationEnabled': deviceCommands.SECURITY_ENABLE.key
};


let _self, _ViewSettingsFactory;

class AppCtrl extends AbstractPageCtrl{
    constructor($scope, ViewSettingsFactory) {
        super($scope, _appProperties);
        'ngInject';
        _self = this;
        _ViewSettingsFactory = ViewSettingsFactory;
    }

    $onInit() {
        super.$onInit();
        _self.menuItems = _ViewSettingsFactory.getMenu();
    }
}


AppCtrl.$inject = ['$scope', 'ViewSettingsFactory'];
export default AppCtrl