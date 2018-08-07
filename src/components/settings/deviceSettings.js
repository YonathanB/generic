
export default class DeviceSettingsCtrl {
    constructor() {
        'ngInject';
        this.$onInit = function () {
            console.log(this)
            this.disableSecurityDialogVisible = false;
            this.enableSecurityDialogVisible = false;
            this.factoryReset = false;
        };
        this.$onChanges = function (changes) {
            // if (changes.vm) {
            //     this.vm = angular.copy(this.vm);
            // }
        }
        this.isState = function (currentState, desirableState) {
            return currentState == desirableState;
        };
        this.fileSystemEnable = function () {
            return !(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream);
        };

        this.toggleSecurity = function (val) {
            if (val == 0)
                this.showSecurityDialog = true;
            else
                this.showSecurityDialog = false;
        };

        this.toggleFactoryReset = function () {
            this.factoryReset = !this.factoryReset;
        };
        this.ProceedFactoryReset = function () {
            this.factoryReset = !this.factoryReset;
            //TODO - call service for factory reset
        };

    }

}