
class kSecurityToggle {
    constructor($scope) {
        'ngInject';
        let $ctrl = this;
        let _IsSecurityEnabled;

        $ctrl.$onInit = function () {
            _init()
        };
        $ctrl.$onChanges = function (changes) {
         if($ctrl.isAuthenticationEnabled) {
             _IsSecurityEnabled = parseInt($ctrl.isAuthenticationEnabled);
            }
        }
        $ctrl.toggleSecurityDialog = function () {
            $ctrl.isSecurityDialogVisible = !$ctrl.isSecurityDialogVisible;
        };

        $ctrl.toggleSecurity = function (){
            if (!!_IsSecurityEnabled) {
                $ctrl.toggleSecurityDialog();
            } else{
                $ctrl.sendCommand(true);
            }

        };
        $ctrl.sendCommand = function(enableSecurity){
            let args = {};
            if(!enableSecurity) {
                args.data = {
                    params: [$ctrl.pwd]
                };
            } else{
                args.data = {
                    params: null
                };
            }
            $ctrl.toggleAuthentication(args)
                .then(function (res) {
                    if(res[0].errCode){
                        $ctrl.wrongPassword = true;
                    } else _init();

                    $scope.$applyAsync();
                })
        };

        function _init(){
            $ctrl.isSecurityDialogVisible = false;
            $ctrl.pwd = '';
            $ctrl.wrongPassword = false;
        }
    }
}


kSecurityToggle.$inject = ['$scope'];
export default kSecurityToggle
