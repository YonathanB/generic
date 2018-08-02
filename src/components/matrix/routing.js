/***********************************************
 * File Name:
 * Created by: Yonathan Benitah
 * On: 06/11/2016  12:29
 * Last Modified: 06/11/2016
 * Modified by: ybenitah
 ***********************************************/

// (function () {

    // angular.module('components.matrix')


//         .controller('routingCtrl', [
//             '$scope',
//             '$filter',
//             '$timeout',
//             'Matrix',
//             'DeviceModel',
//             'Commands',
//             'ConnectorsFactory',
//             'matrix',
//             function ($scope, $filter, $timeout, K_Port, deviceModel, Commands, ConnectorsFactory, Matrix) {
//                 //TODO remove dependency to ConnectorsFactory
//                 $scope.prop = {
//                     "routes": "MATRIX_STATUS",
//                     "portsList": "PORTS_LIST"
//                 };
//
//                 $scope.vm = Matrix.data;
//
//                 $scope.filters = [ //TODO should be in info JSON
//                     {
//                         label: 'AUDIO / VIDEO',
//                         ports: ConnectorsFactory.signalsToPort['VIDEO'].concat(ConnectorsFactory.signalsToPort['AUDIO']),//.unique(),
//                         value: ['VIDEO', 'AUDIO']
//                     },
//                     {
//                         label: 'RS232',
//                         ports: ConnectorsFactory.signalsToPort['RS232'],
//                         value: ['RS232']
//                     },
//                     {
//                         label: 'IR',
//                         ports: ConnectorsFactory.signalsToPort['IR'],
//                         value: ['IR']
//                     },
//                     {
//                         label: 'USB',
//                         ports: ConnectorsFactory.signalsToPort['USB'],
//                         value: ['USB']
//                     }];
//                 $scope.currentFilter = 0;
//                 $scope.applyFilter = function (index) {
//                     $scope.portsList =
//                         $filter('portFilter')($scope.vm[$scope.prop.portsList], $scope.filters[index].value, 'supportedSignals')
//                     $scope.currentFilter = index;
//                 };
//                 $scope.applyFilter(0);
//
//
//                 // var portsType = [];
//                 // for (var port in Matrix.data[$scope.prop.portsList]) {
//                 //     if (portsType.indexOf(port.portType) === -1)
//                 //         portsType.push(port.portType);
//                 // }
//                 // $scope.$watchCollection('vm.MATRIX_STATUS', function (newValue) {
//                 //     $scope.vm.matrix.routes = newValue;
//                 // });
//
//
//                 // $scope.portsList = Matrix.portsList;
//                 // $scope.MatrixVM = Matrix.portsList.byDirection;
//                 // $scope.MatrixVM.routes = Matrix.MATRIX_STATUS;
//                 // $scope.MatrixVM.switchablePorts = Matrix.X_PORT_SELECT_LIST;
//                 // $scope.MatrixVM.updateDevice = Matrix.update;
//                 // $scope.portsTypes =  Matrix.portsType;
//                 // $scope.switchablePorts = ConnectorsFactory.switchablePorts;
//
//
//                 if (deviceModel.global) {
//                     if (!deviceModel.global.initialized)
//                         deviceModel.global.init().then(function () {
//                             $scope.global = deviceModel.global.data;
//                         });
//                     else
//                         $scope.global = deviceModel.global.data;
//                 }
//                 if (deviceModel.POE) {
//                     if (!deviceModel.POE.initialized)
//                         deviceModel.POE.init().then(function () {
//                             $scope.POE = deviceModel.POE.data;
//                         });
//                     else
//                         $scope.POE = deviceModel.POE.data;
//                 }
//                 $scope.updatePOE_Line = function (portId) {
//                     $scope.portsList.updateDevice(K_Port.getPortsList()[portId], Commands.X_POE.key, true);
//                     // return deviceModel.POE.update({
//                     //     command: Commands.X_POE,
//                     //     value: port+',on'
//                     // });
//                 };
//                 $scope.hdbtPower = function (value) {
//                     deviceModel.POE.update({'GLOBAL_POE': value})
//                 };
//
//
//                 if (deviceModel.presets && deviceModel.presets.data.PRST_LIST) {
//                     if (!deviceModel.presets.initialized)
//                         deviceModel.presets.init().then(function (response) {
//                             $scope.presets = response.data.PRST_LIST;
//                             $scope.selectedPreset = $scope.presets[1];
//                         })
//                     else {
//                         $scope.presets = deviceModel.presets.data.PRST_LIST;
//                         $scope.selectedPreset = $scope.presets[1];
//                     }
//
//                     $scope.test = function (selectedPreset) {
//                         $scope.selectedPreset = selectedPreset;
//                     };
//                     $scope.lockPreset = function (state) {
//                         deviceModel.updateDevice({
//                             command: Commands.PRST_LOCK,
//                             value: $scope.selectedPreset.value + ',' + (state ? 'on' : 'off')
//                         })
//                             .then(function (data) {
//                                 if (angular.isUndefined(data.errCode))
//                                     $scope.presets[$scope.selectedPreset.value].locked = (data.value.split(',')[1].toLowerCase() == 'on');
//                             });
//                     };
//
//                     $scope.loadPreset = function () {
//                         if ($scope.selectedPreset.value !== deviceModel.presets.data.PRST_RCL)
//                             deviceModel.updateDevice({
//                                 command: Commands.PRST_RCL,
//                                 value: $scope.selectedPreset.value
//                             })
//                                 .then(function (value) {
//                                     location.reload()
//                                 })
//                     };
//
//                     $scope.presetAction = false;
//                     $scope.savePreset = function () {
//                         $scope.presetAction = true;
//                         deviceModel.updateDevice({
//                             command: Commands.PRST_STO,
//                             value: $scope.selectedPreset.value
//                         })
//                             .then(function (value) {
//                                 $scope.presetAction = false;
//                             })
//                     };
//                 }
//                 $scope.switchPort = function (value, switchableID) {
//                     var port = deviceModel.matrix.inputs[ConnectorsFactory.switchablePorts[switchableID].options[0]];
//                     K_Port.updateDevice(port, Commands.X_PORT_SELECT.key, ConnectorsFactory.switchablePorts[switchableID].options[value]);
//                 };
//
//                 // if (!K_Port.isDetailDataReady())
//                 //     K_Port.initPortsDetails();
//
//
//                 $scope.showSettings = false;
//
//
//                 // //TIMEOUTS
//                 // $scope.timeoutVM = {};
//                 // if (!deviceModel.timeouts.initialized)
//                 //     deviceModel.timeouts.init().then(function () {
//                 //         $scope.videoTimeout = deviceModel.timeouts.data;
//                 //         // $scope.timeoutVM = angular.copy($scope.videoTimeout)
//                 //     })
//                 //
//                 // else {
//                 //     $scope.videoTimeout = deviceModel.timeouts.data;
//                 //     // $scope.timeoutVM = angular.copy($scope.videoTimeout)
//                 // }
//                 // $scope.timeoutToUpdate = {};
//                 // $scope.updateVideoTimeout = function (value, idx) {
//                 //     $scope.timeoutVM[idx] = value;
//                 //     if ($scope.videoTimeout[idx] != $scope.timeoutVM[idx])
//                 //         $scope.timeoutToUpdate[idx] = value;
//                 //     else
//                 //         delete $scope.timeoutToUpdate[idx]
//                 // };
//                 //
//                 // $scope.isEmpty = function (obj) {
//                 //     return angular.equals(obj, {});
//                 // };
//                 //
//                 // var sendTimeout = function () {
//                 //     return deviceModel.timeouts.update($scope.timeoutToUpdate)
//                 //         .then(function (response) {
//                 //             $scope.errorMsg = '';
//                 //             $scope.timeoutSaveFailed = false;
//                 //             for (var i = 0; response.data.length > i; i++) {
//                 //
//                 //                 if (angular.isDefined(response.data[i].errCode)) {
//                 //                     $scope.timeoutSaveFailed = true;
//                 //                     $scope.errorMsg += 'Failed to update' + response.data[i].cmd.key + '\n';
//                 //                 }
//                 //             }
//                 //             $scope.timeoutToUpdate = {};
//                 //         });
//                 // };
//                 // $scope.updateTimer = function () {
//                 //     sendTimeout($scope.timeoutToUpdate).then(function () {
//                 //         for (var timeout in $scope.timeoutVM) {
//                 //             if ($scope.videoTimeout[timeout] != $scope.timeoutVM[timeout] && !$scope.timeoutToUpdate[timeout])
//                 //                 $scope.timeoutToUpdate[timeout] = $scope.timeoutVM[timeout];
//                 //         }
//                 //         if (!angular.equals($scope.timeoutToUpdate, {}))
//                 //             sendTimeout();
//                 //     })
//                 //
//                 //
//                 // }
//                 // $scope.maxTimeout = function (timeout) {
//                 //     if (timeout == 0 || timeout == 5)
//                 //         return Math.min(90, $scope.timeoutVM.AV_SW_TIMEOUT_4, $scope.timeoutVM.AV_SW_TIMEOUT_7);
//                 // };
//                 // $scope.minTimeout = function () {
//                 //     return Math.max($scope.timeoutVM.AV_SW_TIMEOUT_5, $scope.timeoutVM.AV_SW_TIMEOUT_0);
//                 // };
//                 //
//                 // $scope.toggleSettings = function (tabToOpen) {
//                 //     // if (angular.isUndefined(event)) {
//                 //     $scope.showSettings = !$scope.showSettings;
//                 //     $scope.timeoutSaveFailed = false;
//                 //     $scope.tabToOpen = tabToOpen ? tabToOpen : 0;
//                 //     // }
//                 //     // if (!$scope.showSettings)
//                 //     //     $scope.videoTimeout = angular.copy(deviceModel.globalMatrixSetting.data);
//                 // };
//
//                 //K_Port;
//                 // $scope.$watchCollection('MatrixVM.routes', function (newValue) {
//                 //     $scope.MatrixVM.routes = deviceModel.matrix.data.MATRIX_STATUS;
//                 // });
//
//                 $scope.updatePort = function (port, field) {
//                     console.log(port, field);
//                     console.log($scope.MatrixVM);
//                 }
//
//                 // $scope.portCommands = K_Port.getPortsCommands();
//
//
//             }]);
// // })();

class RoutingCtrl {
    constructor($filter, ConnectorsFactory) {
        this.$onInit = function () {
            console.log(this);
        };
        this.prop = {
            "routes": "MATRIX_STATUS",
            "portsList": "PORTS_LIST"
        };

        // this.vm = Matrix.data;

        this.filters = [ //TODO should be in info JSON
            {
                label: 'AUDIO / VIDEO',
                ports: ConnectorsFactory.signalsToPort['VIDEO'].concat(ConnectorsFactory.signalsToPort['AUDIO']),//.unique(),
                value: ['VIDEO', 'AUDIO']
            },
            {
                label: 'RS232',
                ports: ConnectorsFactory.signalsToPort['RS232'],
                value: ['RS232']
            },
            {
                label: 'IR',
                ports: ConnectorsFactory.signalsToPort['IR'],
                value: ['IR']
            },
            {
                label: 'USB',
                ports: ConnectorsFactory.signalsToPort['USB'],
                value: ['USB']
            }];
        this.currentFilter = 0;
        this.applyFilter = function (index) {
            // this.portsList =
            //     $filter('portFilter')(this.vm[this.prop.portsList], this.filters[index].value, 'supportedSignals')
            // this.currentFilter = index;
        };
        this.applyFilter(0);


        this.showSettings = false;


    }
}

export  {
    RoutingCtrl
}