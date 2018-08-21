import aboutCtrl from "./about.controller";

export default require('angular')
    .module('about', [])
    .component('about', {
        bindings: { vm: '<' },
        template: require('./about.html'),
        controller: aboutCtrl
    })
    .name;
