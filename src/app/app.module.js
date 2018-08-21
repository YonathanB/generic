import angular from 'angular';
import $services from '../services/services.module';


import $header from '../components/header/header.module';


// import $widgets from '../components/widgets/widgets.module';

// Following will be set as lazy loading or at least dynamic
// import $about from '../pages/about/about.module';
import $settings from '../pages/settings/settings.module';
import $components from '../components/components.module';
import $uiRouter from '@uirouter/angularjs';

import $oclazyLoad from 'oclazyload';


import AppCtrl from './app.controller'

export default angular
    .module('kramerWeb', [$uiRouter, $oclazyLoad, $header, $components, $services, $settings])
    .component('kramerWeb', {
        bindings: {model:'<'},
        template: require('./app.html'),
        controller: AppCtrl
    })
    .name;

require('./app');
require('./app.config');
require('./app.routes');
// require('../model/ViewSettingsFactory');
// require('../model/IO_ObjectService');