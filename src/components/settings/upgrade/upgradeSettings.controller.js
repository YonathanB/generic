
export default class UpgradeCtrl  {
    constructor() {
        this.$onInit = function () {
            this.firmwareVersion = this.vm.data.VERSION;
            console.log(this)
        };

    }
}