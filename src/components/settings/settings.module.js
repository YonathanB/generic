/**
 *
 * @name components.settings
 *
 * @requires ui.router
 *
 * @description
 *
 * This is the settings module. It includes all of our components for device settings. such as
 * - general settings (device model, name, pwd ...)
 * - network settings (device ip, mask, gateway ...)
 * - upgrade page
 * - NTP settings
 *
 **/
import DeviceSettingsCtrl from './deviceSettings';
import NetworkSettingsCtrl from './network/networkSettings.controller';
import GeneralDeviceSettingsCtrl from './general/generalSettings.controller';
import UpgradeCtrl from './upgrade/upgradeSettings.controller';
import NTPSettingsCtrl  from './ntp/ntpSettings.controller';

import $uiRouter from "@uirouter/angularjs";

import styles from './deviceSettings.less';


class factoryResetCtrl{
    constructor() {
        this.$onInit = function () {
            console.log(this)
        };
        this.closeFactoryReset = function (val) {
            this.onCancel();
        };
        this.ProceedFactoryReset = function () {
            this.onFactoryReset();
        };
    }
}

export default require('angular')
    .module('components.deviceSettings', [$uiRouter])
    .filter('getDateString', function () {
        return function (data) {
            var date = new Date(data);
            var dday = date.getDate();
            var dmon = date.getMonth() + 1;
            var dyear = date.getFullYear();
            var ddate = dday + "-" + dmon + "-" + dyear + ' ' + date.getHours() + ':' + date.getMinutes();
            return ddate;
        };
    })

    .component('deviceSettings', {
        bindings: { vm: '<', },
        template: require('./device-settings.html'),
        controller: DeviceSettingsCtrl
    })
    .component('generalSettings', {
        bindings: {vm: '<'},
        template: require('./general/general-settings.html'),
        controller: GeneralDeviceSettingsCtrl
    })
    .component('networkSettings', {
        bindings: {vm: '<'},
        template: require('./network/networkSettings.html'),
        controller: NetworkSettingsCtrl
    })
    .component('upgrade', {
        bindings: {vm: '<'},
        template: require('./upgrade/firmwareUpgrade.html'),
        controller: UpgradeCtrl
    })
    .component('ntp', {
        bindings: {vm: '<'},
        template: require('./ntp/timeAndDate.html'),
        controller: NTPSettingsCtrl
    })

    .component('factoryResetDialog', {
        template: require('./dialogs/factory-reset.html'),
        controller: factoryResetCtrl,
        bindings: {
            onCancel: '&',
            onFactoryReset: '&'
        },
    })

    .name;

