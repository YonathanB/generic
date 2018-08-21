let _securityProperties = ['currentPassword', 'newPassword', 'confirmPassword'];

let _self;




class SecuritySettingsCtrl {
    constructor($scope) {
        'ngInject';
        _self = this;
        _self.$scope = $scope;

        _self.checkValidity = function () {
            if (!_allFieldsAreFilled()) return;
            if (!_checkPasswordLength()) return;
            if (!_checkPasswordPattern()) return;
            !_newPasswordMatchConfirm();
        };
    }

        $onInit() {
            _self.securityForm = {};// bind form to viewModel

            _self.enableSecurityDialogVisible = false;
            _self.disableSecurityDialogVisible = false;
            _self.showSecurityFields = _self.isAuthenticationEnabled;

            // append new properties to viewModel
            for (let i = 0; i < _securityProperties.length; i++) {
                _self[_securityProperties[i]] = '';
                _self.$scope.$watch(() => _self[_securityProperties[i]], () => _self.checkValidity())
            }

        };


}


SecuritySettingsCtrl.$inject = ['$scope'];
export default SecuritySettingsCtrl


//VALIDATION FUNCTIONS
function _allFieldsAreFilled() {
    let fieldIsEmpty;
    let flag = true;
    for (let i = 0; i < _securityProperties.length && flag; i++) {
        if (_self[_securityProperties[i]] === '') {
            if (fieldIsEmpty !== undefined && !fieldIsEmpty){
                flag = false;
            } else
                fieldIsEmpty = true;
        } else {
            if (fieldIsEmpty === undefined)
                fieldIsEmpty = false;
            else if(fieldIsEmpty)
                flag = false;
        }
    }
    _self.securityForm.$setValidity('password', flag);
    return flag ;
}
function _checkPasswordLength() {
    if(_self.newPassword === '') return true;
    let pwdLength = (_self.newPassword.length < 16 && _self.newPassword.length > 4);
    _self.securityForm.newPassword.$setValidity('password-length', pwdLength);
    return pwdLength;
}
function _checkPasswordPattern() {
    if(_self.newPassword === '') return true;
    let pwdPattern = /^(?!-)(?!.*-$)[a-zA-Z0-9-]+$/.test(_self.newPassword);
    _self.securityForm.newPassword.$setValidity('password-pattern', pwdPattern);
    return pwdPattern;
}
function _newPasswordMatchConfirm() {
    _self.securityForm.confirmPassword.$setValidity('confirm-password',
        _self.newPassword === _self.confirmPassword);
    return (_self.newPassword === _self.confirmPassword);
}