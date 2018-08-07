export default class GeneralDeviceSettingsCtrl {
    constructor() {
        // let model;
        // this.$onInit = function () {
        //     model = angular.copy(this.vm);
        // };
        // this.$onChanges = function (changes) {
        //     if (changes.vm) {
        //         this.properties = Object.assign({}, this.vm);
        //     }
        // }
        this.$doCheck = function (evt) {
            let oldVM;
            if (!angular.equals(this.properties, this.vm)) {
                this.properties = Object.assign({},this.vm);
                // this.properties = Object.assign({}, oldVM);
            }
            // console.log('assign to properties ', evt)
        }
        // TODO - security to implement
        this.toggleSecurity = function (val) {
            if (val == 0)
                this.showSecurityDialog = true;
            else
                this.showSecurityDialog = false;
        };
    }
}