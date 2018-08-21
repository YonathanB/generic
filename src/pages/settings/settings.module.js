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
import SecuritySettingsCtrl from './security/securitySettings.controller';
import UpgradeCtrl from './upgrade/upgradeSettings.controller';
import NTPSettingsCtrl  from './ntp/ntpSettings.controller';

import ngMessages from 'angular-messages'; // check if loaded twice
import $uiRouter from "@uirouter/angularjs";


import './deviceSettings.less';

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
    .module('components.deviceSettings', [$uiRouter, ngMessages])
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
        bindings: { model: '<', },
        template: require('./device-settings.html'),
        controller: DeviceSettingsCtrl
    })
    .component('generalSettings', {
        bindings: {model: '<'},
        require: {app: '^kramerWeb'},
        template: require('./general/general-settings.html'),
        controller: GeneralDeviceSettingsCtrl
    })
    .component('securitySettings', {
        bindings: {isAuthenticationEnabled: '<', toggleAuthentication:'<'},
        template: require('./security/security-settings.html'),
        controller: SecuritySettingsCtrl
    })
    .component('networkSettings', {
        bindings: {model: '<'},
        template: require('./network/networkSettings.html'),
        controller: NetworkSettingsCtrl
    })
    .component('upgrade', {
        bindings: {model: '<'},
        template: require('./upgrade/firmwareUpgrade.html'),
        controller: UpgradeCtrl
    })
    .component('ntp', {
        bindings: {model: '<'},
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

