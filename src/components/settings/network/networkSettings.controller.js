export default class NetworkSettingsCtrl {
    constructor() {
        this.$onInit = function () {
            console.log(this)
            this.properties = this.vm;
        };
    }
}