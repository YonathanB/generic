import {applicationStarter} from '../model/applicationStarter';
console.log(applicationStarter);




class AppCtrl {
    constructor($scope, ViewSettingsFactory) {
        'ngInject';
        // const VM = applicationStarter.getViewModel();
        let $ctrl = this;
        $ctrl.$onChanges = function (changes) {
            if (changes.deviceName && !changes.deviceName.isFirstChange()) {
                $ctrl.updateView();
            }

        };
        $ctrl.updateView = function () {
            console.log('AppCtrl ',$ctrl)
        }

        $ctrl.$onInit = function () {
            $ctrl.vm = applicationStarter.getViewModel();
            $ctrl.menuItems = ViewSettingsFactory.getMenu();
        }

    }
}


AppCtrl.$inject = ['$scope', 'ViewSettingsFactory'];
export default AppCtrl