import kSecurityToggle from "./kSecurityToggle";

export default require('angular')
    .module('components.kSecurityToggle', [])
    .component('kSecurityToggle', {
        bindings: { type: '@', isAuthenticationEnabled:'<', toggleAuthentication: '&'},
        template: require('./security-toggle.html'),

        controller: kSecurityToggle
    })
    .name;