"use strict";
/**
 * @fileOverview This is the entry point of the application.
 *
 * **Flow is as follow**
 *
 *  * The <a href="module-core_model-DeviceModel.html#start">`deviceModel.start`</a> function call the <a href="module-core_data-K_DataProxy.html">`K_DataProxy`</a> to enable an access to device's data.
 * `K_DataProxy` implements an access to device (following info file - websocket or polling) and
 * start to ask for device data
 * For an `angular.js` app run block calls for `deviceModel.start`, that returns a promise once
 * info file get from device and communication enabled
 * @requires angular
 * @requires kramerWeb The Kramer angular app for the web
 * @requires app.less
 * @example
 angular.module('kramerWeb')
 .run(['$http',
 '$rootScope',
 '$q',
 '$uiRouter',
 'DataProxy',
 'ViewSettingsFactory',
 function ($http, $rootScope, $q, $uiRouter, DataProxy, ViewSettingsFactory) {

            deviceModel.start().then(function (infoFile) {
                ViewSettingsFactory.initMenu(infoFile.states, deviceModel);
                 });
            }]);
 *
 *

 *
 */


import angular from 'angular';
// import Promise from 'babel-polyfill'
import kramerWeb from './app/app.module';

import './assets/styles/app.less';

export default angular.module(kramerWeb);