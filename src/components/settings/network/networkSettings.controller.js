export default class NetworkSettingsCtrl {
    constructor() {
        let $ctrl = this;
        $ctrl.$onChanges = function (changes) {
            if (changes.vm) {
                console.log(changes.vm)
            }
        };

    }
}