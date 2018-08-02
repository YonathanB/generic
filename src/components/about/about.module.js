// import angular from 'angular';
import aboutCtrl from "./about.controller";

export default require('angular')
    .module('components.about', [])
    .component('about', {
        bindings: { vm: '<' },
        template: require('./about.html'),
        controller: aboutCtrl
    })
    .name;

// require('./about.controller');