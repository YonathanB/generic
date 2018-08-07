import headerCtrl from "./header.controller";

export default require('angular')
    .module('components.header', [])

    .component('kHeader', {
        bindings: { vm: '<' },
        template: require('./header.html'),
        controller: headerCtrl
    })
    .name;
