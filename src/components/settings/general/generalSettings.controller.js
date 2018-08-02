export default class GeneralDeviceSettingsCtrl {
    constructor() {
        this.$onInit = function () {
            this.properties = this.vm;
        };
        // TODO - security to implement
        this.toggleSecurity = function (val) {
            if (val == 0)
                this.showSecurityDialog = true;
            else
                this.showSecurityDialog = false;
        };
    }
}