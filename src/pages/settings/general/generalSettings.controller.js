import {deviceCommands} from "../../../core/data/Commands";


// let $ctrl = this;
class MainCtrl {
    constructor($scope, properties) {
        this.vm = {};
        this.scope = $scope;
        this.properties = properties;
    }
        $onChanges(changes) {
            for(let prop in this.properties) {
                this.vm[prop] = this.test.vm.data[this.properties[prop]];
            }
        };

        $onInit() {
            for(let prop in this.properties) {
                this.scope.$watch(() => this.test.vm.data[this.properties[prop]],
                    (newValue, oldValue) => {
                        if (newValue !== oldValue) {
                            this.vm[prop] = this.test.vm.data[this.properties[prop]];
                        }
                    });
            }
        };

}



let _generalProperties = {
    'deviceName': deviceCommands.NAME.key,
    'deviceModel': deviceCommands.MODEL.key,
    'firmwareVersion': deviceCommands.VERSION.key,
    'isAuthenticationEnabled': deviceCommands.SECURITY_ENABLE.key
};

export default class GeneralDeviceSettingsCtrl extends MainCtrl{
    constructor($scope) {
        super($scope, _generalProperties);
        let $ctrl = this;

        $ctrl.update = function(toUpdate) {
            console.log(toUpdate, $ctrl.vm[toUpdate[0]]);
        }
    }
}