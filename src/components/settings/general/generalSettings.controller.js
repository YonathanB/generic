let _vmSource = {};

export default class GeneralDeviceSettingsCtrl {
    constructor() {
        this.$onChanges = function (changes) {
            _vmSource = Object.assign({}, this.vm);
            if (changes.vm) {
                this.properties = this.vm;//Object.assign({}, this.vm);
            }
        };



    }
}