export default class SecuritySettingsCtrl {
    constructor() {
        this.$onChanges = function (changes) {
            if (changes.vm) {
                this.properties = this.vm;
            }
        };

        this.$onInit = function(){
            this.enableSecurityDialogVisible = false;
            this.disableSecurityDialogVisible = false;
            this.showSecurityFields = this.properties.SECURITY_ENABLE;
            this.security = {
                currentPassword:'',
                newPassword: '',
                confirmPassword: ''
            }
        }

        // TODO -  move to component
        this.toggleSecurity = function () {
            this.showSecurityFields = this.properties.SECURITY_ENABLE;
        };


    }
}