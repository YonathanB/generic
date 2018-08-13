/***********************************************
 * File Name:
 * Created by: Yonathan Benitah
 * On: 07/11/2016  11:30
 * Last Modified: 07/11/2016
 * Modified by: ybenitah
 ***********************************************/

(function () {
    angular.module('web.controllers').controller('networkCtrl', [
        '$rootScope',
        '$scope',
        'networkProperties',
        'DeviceModel',
        'Commands',
        '$timeout',
        function ($rootScope, $scope, networkProperties, applicationStarter, Commands, $timeout) {
           
            $scope.resetDHCP = function(){
                $timeout(function(){

                $scope.dhcpStatus = networkProperties.data.NET_DHCP;
                },0)
            };
            $scope.properties = networkProperties;
            $scope.dhcpStatus = networkProperties.data.NET_DHCP;

            $scope.properties.data.dhcpStatus = $scope.dhcpStatus;
            var net_ipCopy = networkProperties.data.NET_IP;

            $scope.newIP = {
                customIP: $scope.properties.data.NET_IP,
                DHCPOffSelectedOption: 1
            };
            $scope.toggleDHCP = function (value) {
                $scope.selectedCommunicationMBRefernce = "dhcp";
                $scope.dhcpStatus = value;
                $scope.properties.data.dhcpStatus = $scope.dhcpStatus;
                //     $scope.isCommunicationWarningMBVisible = true;
                // if (value == 1) {
                // }
                if ($scope.dhcpStatus == 0 && deviceModel.networkProperties.data.NET_DHCP == 1)
                    deviceModel.networkProperties.data.NET_IP = "0.0.0.0";
                if ($scope.dhcpStatus == 1 && deviceModel.networkProperties.data.NET_DHCP == 1)
                    deviceModel.networkProperties.data.NET_IP = net_ipCopy;
                // else {
                //     $scope.isNewIPDialogVisible = true;
                //     $scope.newIP = {
                //         customIP: $scope.properties.data.NET_IP,
                //         DHCPOffSelectedOption: 1
                //     };
                // }
            };

            $scope.submitDHCPDisable = function () {

            }

            $scope.setDHCP_ON = function () {
                deviceModel.enableDHCP();
                $scope.isCommunicationWarningMBVisible = false;
            };


            $scope.closeDHCPDialog = function () {
                $scope.dhcpStatus = 0;
                $scope.isCommunicationWarningMBVisible = false;
            };

            $scope.closeNewIPDialog = function () {
                $scope.isNewIPDialogVisible = false;
            };
            

            $scope.ErrorIsEmpty = function (obj) {
                return Object.keys(obj.$error).length === 0;
            }
            $scope.disableDHCP = function (evt) {
                $scope.closeNewIPDialog();
                var newIP = $scope.newIP.customIP;
                if (newIP.indexOf('undefined') === -1) {
                    if ($scope.dhcpForm.$valid) {
                        deviceModel.setIP(newIP);
                        $rootScope.launchGlobalMessage("IP has changed you'll be redirected soon!", 20);
                        $timeout(function () {
                            window.location = "http://" + newIP;
                        }, 20000);
                    }
                }
            };
            $scope.reset = function () {
                return networkProperties.init(true).then(function (data) {
                    return true;
                }, function (data) {
                    return false;
                })
            };

            $scope.checkNetwork = function (data, before) {
                if ($scope.dhcpStatus == 1)
                    $scope.isCommunicationWarningMBVisible = true;


                if (deviceModel.networkProperties.data.NET_IP != before.NET_IP ||
                    deviceModel.networkProperties.data.NET_MASK != before.NET_MASK ||
                    deviceModel.networkProperties.data.NET_GATE != before.NET_GATE)
                    return deviceModel.updateNetworkData(data);
            };

        }])
})();
