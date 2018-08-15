export default class GeneralDeviceSettingsCtrl {
    constructor() {
        let $ctrl = this;
        this.$onChanges = function (changes) {
            if (changes.vm){
                $ctrl.vm.security = {
                    SECURITY_ENABLE: $ctrl.vm.data.SECURITY_ENABLE
                }
            }
        };
        $ctrl.update = function(toUpdate){
            console.log(toUpdate, $ctrl.properties);
        }

    }
}