import kSecurityToggle from "../../components/kSecurityToggle/kSecurityToggle";

class DeviceSettingsCtrl {
    constructor($state) {
        'ngInject';

        const $ctrl = this;

        $ctrl.$onInit = function () {
            let currentStateName = $state.current.parent;
            $ctrl.subStates = $state.get().filter(function(cState) { return cState.parent && cState.parent.indexOf(currentStateName) === 0 });

            $ctrl.disableSecurityDialogVisible = false;
            $ctrl.enableSecurityDialogVisible = false;
            $ctrl.factoryReset = false;
        };
        $ctrl.$onChanges = function (changes) {
        }
        $ctrl.isState = function (currentState, desirableState) {
            return currentState == desirableState;
        };
        $ctrl.fileSystemEnable = function () {
            return !(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream);
        };

        $ctrl.toggleSecurity = function (val) {
            if (val == 0)
                $ctrl.showSecurityDialog = true;
            else
                $ctrl.showSecurityDialog = false;
        };

        $ctrl.toggleFactoryReset = function () {
            $ctrl.factoryReset = !$ctrl.factoryReset;
        };
        $ctrl.ProceedFactoryReset = function () {
            $ctrl.factoryReset = !$ctrl.factoryReset;
            //TODO - call service for factory reset
        };

    }

}

DeviceSettingsCtrl.$inject = ['$state'];

export default DeviceSettingsCtrl