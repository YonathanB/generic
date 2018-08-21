import angular from 'angular';
import $model from '../model/model.module';


import $header from '../components/header/header.module';


// import $widgets from '../components/widgets/widgets.module';

// Following will be set as lazy loading or at least dynamic
// import $about from '../pages/about/about.module';
import $settings from '../pages/settings/settings.module';
import $components from '../components/components.module';
import $uiRouter from '@uirouter/angularjs';

import $oclazyLoad from 'oclazyload';
import DeviceSettingsCtrl from "../pages/settings/deviceSettings";
// import $data from '../core/data/data.module';


import appCtrl from './app.controller'

export default angular
    .module('kramerWeb', [$uiRouter, $oclazyLoad, $header, $components, $model, $settings])
    .component('kramerWeb', {
        bindings: { deviceName: '<', },
        template: require('./app.html'),
        controller: appCtrl,
        controllerAs: 'MainCtrl'
    })
    .name;

require('./app');
require('./app.config');
require('./app.routes');
// require('../model/ViewSettingsFactory');
// require('../model/IO_ObjectService');