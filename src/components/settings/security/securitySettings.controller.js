
let _self;

let _securityProperties = ['currentPassword', 'newPassword', 'confirmPassword'];

export default class SecuritySettingsCtrl {
    constructor() {

        _self = this;

        _self.$onInit = function () {
            _self.securityForm = {};// bind form to viewModel

            _self.enableSecurityDialogVisible = false;
            _self.disableSecurityDialogVisible = false;
            _self.showSecurityFields = _self.vm.data.SECURITY_ENABLE;

            // append new properties to viewModel
            for(let i = 0; i < _securityProperties.length; i++){
                _self.vm.data[_securityProperties[i]] = '';
            }
        };

        _self.$doCheck = function () {
            if (_self.securityForm.hasOwnProperty('$dirty') && _self.securityForm.$dirty) {
                console.log('Perform some test on the securityForm');
                if (!_allFieldsAreFilled()) return;
                if (!_checkPasswordLength()) return;
                if (!_checkPasswordPattern()) return;
                !_newPasswordMatchConfirm();
            }

        };
        // TODO -  move to component
        _self.toggleSecurity = function () {
            _self.showSecurityFields = _self.vm.SECURITY_ENABLE;
        };



        //VALIDATION FUNCTIONS
        function _allFieldsAreFilled() {
            let aFieldIsFill = false;
            let allFields = true; // beginning all fields are empty
            for(let i = 0; i < _securityProperties.length; i++){
                if(_self.vm.data[_securityProperties[i]] !== ''){
                    aFieldIsFill = true;
                    continue;
                }
                if(aFieldIsFill && _self.vm.data[_securityProperties[i]] === '') {
                    allFields = false;
                    break;
                }
            }
            _self.securityForm.$setValidity('password', allFields);
            return aFieldIsFill && allFields;
        }
        function _checkPasswordLength() {
            let pwdLength = (_self.vm.data.newPassword.length < 16 && _self.vm.data.newPassword.length > 4);
            _self.securityForm.newPassword.$setValidity('password-length', pwdLength);
            return pwdLength;
        }
        function _checkPasswordPattern() {
            let pwdPattern = /^(?!-)(?!.*-$)[a-zA-Z0-9-]+$/.test(_self.vm.data.newPassword);
            _self.securityForm.newPassword.$setValidity('password-pattern', pwdPattern);
            return pwdPattern;
        }
        function _newPasswordMatchConfirm() {
            _self.securityForm.confirmPassword.$setValidity('confirm-password',
                _self.vm.data.newPassword === _self.vm.data.confirmPassword);
            return (_self.vm.data.newPassword === _self.vm.data.confirmPassword);
        }
    }
}