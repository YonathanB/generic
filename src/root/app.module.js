import angular from 'angular';
import $model from '../model/model.module';
// import $widgets from '../components/widgets/widgets.module';
import $components from '../components/components.module';
import $uiRouter from '@uirouter/angularjs';
import $oclazyLoad from 'oclazyload';
import $data from '../core/data/data.module';

export default angular
    .module('kramerWeb', [$model, $uiRouter, $oclazyLoad, $components, $data])
    .name;

require('./app');
require('./app.config');
require('./app.routes');
// require('../model/ViewSettingsFactory');
// require('../model/IO_ObjectService');