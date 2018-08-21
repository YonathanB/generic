import headerCtrl from "./header.controller";
import kSecurityToggle from '../kSecurityToggle/kSecurityToggle.module'


export default require('angular')
    .module('components.header', [kSecurityToggle])

    .component('kHeader', {
        bindings: { isAuthenticationEnabled:'<',  toggleAuthentication:'<', deviceModel: '<' },
        template: require('./header.html'),
        controller: headerCtrl
    })
    .name;
