/***********************************************
 * File Name: deviceSettings.js
 * Created by: Yonathan Benitah
 * On: 21/11/2016  15:30
 * Last Modified:
 * Modified by:
 ***********************************************/
export default class deviceSettingsCtrl {
    constructor() {
        this.$onInit = function () {
            this.properties = this.vm;
        };
        // TODO - security to implement
        this.toggleSecurity = function (val) {
            if (val == 0)
                this.showSecurityDialog = true;
            else
                this.showSecurityDialog = false;
        };
        this.toggleFactoryReset = function () {
                this.factoryReset = !this.factoryReset;
            };

        this.ProceedfactoryReset = function () {
            this.toggleFactoryReset();
                // deviceModel.FactoryReset();
            };
    }
}

//
// (function () {
//     angular.module('web.controllers')
//         .controller('deviceSettingsCtrl', [
//         '$scope',
//         'DeviceModel',
//         'Commands',
//         'deviceProperties',
//         'Authentication',
//         '$timeout',
//         'MessageService',
//         function ($scope, deviceModel, Commands, properties, Authentication, $timeout, MessageService) {
//
//
//
//             properties.data.Authentication = {
//                 enable: Authentication.get,
//                 currentPassword: '',
//                 confirmPassword: '',
//                 newPassword: ''
//             };
//             $scope.security = properties.data.Authentication;
//             $scope.securityDialog = {
//                 enable: Authentication.get,
//                 pwd: null
//             };
//             $scope.UpdateAuthentication = function () {
//                 if ($scope.security.currentPassword && $scope.security.newPassword && $scope.security.confirmPassword)
//                     deviceModel.updateSecurityPassword($scope.security.newPassword, $scope.security.currentPassword);
//             };
//
//             $scope.properties = properties;
//
//             var updateSecurityPropertiesField = function () {
//                 $scope.showSecurityProperties = ($scope.securityDialog.enable() == 1);
//             };
//             updateSecurityPropertiesField();
//             // Open security DialogBox
//             $scope.togglePwdState = function (val) {
//                 $scope.passwordOK = false;
//             };
//             $scope.toggleFrontPanel = function (val) {
//                 // deviceModel.updateDevice({
//                 //     command: Commands.LOCK_FP,
//                 //     value: val == 1? 'ON': 'OFF'
//                 // })
//                 properties.data.FrontPanel = val
//                 // $scope.properties.update()
//             }
//
//
//             $scope.passwordOK = false;
//             // Close security DialogBox for security disable
//             $scope.closeDisableSecurityDialogBox = function (disableSecurity) {
//                 $scope.passwordOK = false;
//                 if (disableSecurity)
//                     deviceModel.disableSecurity($scope.securityDialog.pwd).then(function () {
//                         $scope.disableSecurityDialogVisible = false;
//                         updateSecurityPropertiesField();
//                     }, function () {
//                         $scope.passwordOK = true;
//                     });
//
//                 else $scope.disableSecurityDialogVisible = false;
//
//             };
//             // Close security DialogBox for security enable
//             $scope.closeEnableSecurityDialogBox = function (enableSecurity) {
//                 if (enableSecurity) {
//                     deviceModel.enableSecurity($scope.securityDialog.pwd).then(function () {
//                         $scope.enableSecurityDialogVisible = false;
//                         updateSecurityPropertiesField();
//                     }, function () {
//                         $scope.passwordOK = true;
//                     });
//                 }
//                 else $scope.enableSecurityDialogVisible = false;
//             };
//
//             $scope.factoryReset = false;
//             $scope.toggleFactoryReset = function () {
//                 $scope.factoryReset = !$scope.factoryReset;
//             };
//             $scope.restartDevice = function () {
//                 deviceModel.restart();
//             };
//
//             $scope.ProceedfactoryReset = function () {
//                 $scope.toggleFactoryReset();
//                 deviceModel.FactoryReset();
//             };
//
//             //FIRMWARE UPGRADE
//
//             var KPTW = "kptw";
//
//
//             //$scope.fileDataToUpload = null;
//             $scope.upload = {"fileName": ""};
//             $scope.isUploading = false;
//             //$scope.isKptUploadFile = false;
//
//             $scope.fu_uploading_progress = "idle";
//             $scope.fu_updating_progress = "idle";
//             $scope.fu_restart_progress = "idle";
//
//             $scope.fu_showErrorMessage = false;  // SHOW ERROR MESSAGE
//             $scope.fw_error_msg_ref = "";        // SELECT TEXT ERROR: error / invalid / filetype
//             $scope.fu_err_reference = "";        // CODE ERROR THAT THE DEVICES WAS RETURN (on fw_error_msg_ref='error')
//
//
//             $scope.STEPS = {
//                 "INACTIVE": 0,
//                 "CONFIRMATION": 1,
//                 "START": 2,
//                 "UPLOAD": 3,
//                 "UPDATE": 4,
//                 "RESET": 5,
//                 "END": 6
//             };
//
//             $scope.action = {};
//             $scope.action.step = $scope.STEPS.INACTIVE;
//
//             $scope.$watch('upload.fileName', function (newVal, oldVal) {
//                 if (newVal != "") {
//                     if (checkFileType(newVal, [KPTW, 'kpt']))
//                         $scope.action.step = $scope.STEPS.CONFIRMATION;
//                     else
//                         upgradeFailed();
//                 }
//                 else if (oldVal != "") {
//                     upgradeFailed();
//                 }
//             });
//
//
//             var upgradeFailed = function () {
//                 $scope.upload.fileName = "";
//                 $timeout(function () {
//                     $scope.action.step = $scope.STEPS.INACTIVE;
//                     MessageService.newMessage({
//                         title: 'Firmware Upgrade Failed',
//                         type: 'error',
//                         isModal: true,
//                         closeBtn: false,
//                         body: '<p>Firmware upgrade aborted!<br>' +
//                         '<p style="font-size: 14px; font-weight: bold">Check the uploaded file.</p>',
//                         buttons: [{
//                             text: MessageService.button.ok,
//                             onClick: function () {
//                                 angular.noop();
//                             }
//                         }]
//                     });
//                 }, 1000)
//             };
//
//             $scope.uploadFirmware = function () {
//                 $scope.action.step = $scope.STEPS.START;
//                 var url = "system/upgrade";
//                 data = {
//                     "file": $scope.upload.fileDataToUpload,
//                 };
//                 var fd = new FormData();
//                 angular.forEach(data, function (value, key) {
//                     fd.append(key, value);
//                 });
//
//                 $.ajax({
//                     'async': true,
//                     'type': "POST",
//                     'global': false,
//                     'dataType': 'html',
//                     'url': url,
//                     'data': fd,
//                     'success': function (data) {
//                         $scope.$apply(function () {
//                             console.log("ajax data:", data);
//                             try {
//                                 data = JSON.parse(data);
//                             }
//                             catch (e) {
//                                 data = {"cmd": "upload", "success": 0, "message": "Invalid file format"};
//                             }
//                             if (data.success == 0) {
//                                 upgradeFailed();
//                             }
//                             else {
//                                 $scope.resetDevice();
//                             }
//
//                         });
//
//
//                     },
//                     'error': function (data) {
//                         upgradeFailed();
//                         $scope.action.step = $scope.STEPS.INACTIVE;
//                         $scope.fu_err_reference = "error";
//                         $scope.action.type = "error";
//                     },
//                     xhr: function () {
//                         var xhr = new window.XMLHttpRequest();
//                         //Download progress
//                         xhr.addEventListener("progress", function (evt) {
//                             console.log("progress", evt);
//                             if (evt.lengthComputable) {
//                                 var percentComplete = evt.loaded / evt.total;
//                                 // progressElem.html(Math.round(percentComplete * 100) + "%");
//                                 console.log("progress", Math.round(percentComplete * 100) + "%");
//                             }
//                         }, false);
//                         return xhr;
//                     },
//                     beforeSend: function () {
//                         console.log("before send");
//                         $scope.action.step = $scope.STEPS.UPLOAD;
//
//                     },
//                     complete: function () {
//                         console.log("after send");
//                     },
//                     cache: false,
//                     contentType: false,
//                     processData: false
//                 });
//                 // return deferred.promise;
//             };
//
//
//             $scope.resetDevice = function () {
//                 $scope.action.step = $scope.STEPS.UPDATE;
//
//                 deviceModel.updateDevice({
//                     command: Commands.UPGRADE,
//                     value: ''
//                 })
//                     .then(function (result) {
//                             console.log(result);
//                             if (angular.isDefined(result.errCode))
//                                 upgradeFailed();
//                             else {
//                                 $scope.action.step = $scope.STEPS.RESET;
//                                 deviceModel.updateDevice({
//                                     command: Commands.RESTART,
//                                     value: ''
//                                 }).then(function (data) {
//                                         //Don't need to do anything.
//                                         // the WS will be closed automatically and reconnection automatically done
//                                         $timeout(function () {
//                                             $scope.action.step = $scope.STEPS.END;
//                                             $timeout(function () {
//                                                 $scope.action.step = $scope.STEPS.INACTIVE;
//                                                 deviceModel.onRestart.refresh();
//                                             }, 1000 * 5);
//
//                                         }, 1000 * 10);
//                                     },
//                                     function () {
//                                         $scope.action.step = $scope.STEPS.INACTIVE;
//                                         $scope.fw_error_msg_ref = "error";
//                                         $scope.action.message = "Error during Firmware upgrade upload";
//                                         $scope.action.type = "error";
//                                         $scope.action.command = "firmware-message";
//                                     });
//                             }
//                         },
//                         function () {
//                             $scope.action.step = $scope.STEPS.INACTIVE;
//                             $scope.action.message = "Error during Firmware upgrade upload";
//                             $scope.action.type = "error";
//                             $scope.action.command = "firmware-message";
//                         })
//
//
//             };
//
//
//             var checkFileType = function (filename, typeArr) {
//                 for (var i = 0; i < typeArr.length; i++) {
//                     var type = typeArr[i].toLowerCase();
//                     var re = /(?:\.([^.]+))?$/;
//                     var extension = re.exec(filename)[0];   //example: ".txt"
//                     var fileExt = filename.substr(filename.indexOf(extension) + 1).toLowerCase();
//                     if (fileExt == type) {
//                         return true;
//                     }
//                 }
//
//             };
//
//             $scope.fu_closeError = function () {
//                 $scope.fu_showErrorMessage = false;
//             };
//
//             $scope.isState = function (currentState, desirableState) {
//                 return currentState == desirableState;
//             }
//
//
//             $scope.activeTab = 'General';
//
//             $scope.refreshForm = {};
//
//
//         }
//     ])
//
//
//         .filter('getDateString', function () {
//             return function (data) {
//                 var date = new Date(data);
//                 var dday = date.getDate();
//                 var dmon = date.getMonth() + 1;
//                 var dyear = date.getFullYear();
//                 var ddate = dday + "-" + dmon + "-" + dyear + ' ' + date.getHours() + ':' + date.getMinutes();
//             return ddate;
//         };
//     })
//         .controller('timeAndDateCtrl', ['$scope', 'NTP', 'DeviceModel', function ($scope, deviceTimeProperties, deviceModel) {
//             console.log('timeAndDate controller');
//
//             $scope.timeProperties = deviceTimeProperties;
//             $scope.timeData = deviceTimeProperties;
//
//
//             $scope.updateTime = function () {
//                 deviceTimeProperties.data.TIME.time = deviceTimeProperties.data.TIME.date.getHours() + ':' + deviceTimeProperties.data.TIME.date.getMinutes();
//             };
//
//
//             var checkDateTime = function () {
//                 deviceModel.send([deviceTimeProperties.commands.TIME])
//                     .then(function(data){
//                         deviceTimeProperties.data.TIME = deviceTimeProperties.commands.TIME.parserOnMessage(data[0].value).value;
//                      });
//             }
//             var timeIntervalChecker;
//             var start_time_checker = function () {
//                 checkDateTime();
//                 timeIntervalChecker = setInterval(function () {
//                     if (typeof deviceTimeProperties.data.TIME.date === "string"
//                         &&
//                         document.getElementsByClassName('quickdate-popup')[0] && document.getElementsByClassName('quickdate-popup')[0].className.indexOf('open') === -1)
//                         checkDateTime();
//                 }, 30000);
//             };
//
//             if (deviceTimeProperties.data.TIME)
//                 start_time_checker();
//
//             $scope.$on("$destroy", function () {
//                 clearInterval(timeIntervalChecker);
//             });
//
//             $scope.timeZones =  deviceModel.TimeZoneList || [
//                 {
//                     "value": "-12",
//                     "name": "(GMT-12:00) International Date Line West"
//                 },
//                 {
//                     "value": "-11",
//                     "name": "(GMT-11:00) Midway Island, Samoa"
//                 },
//                 {
//                     "value": "-10",
//                     "name": "(GMT-10:00) Hawaii"
//                 },
//                 {
//                     "value": "-9",
//                     "name": "(GMT-09:00) Alaska"
//                 },
//                 {
//                     "value": "-8",
//                     "name": "(GMT-08:00) Pacific Time (US &amp; Canada)"
//                 },
//                 {
//                     "value": "-7",
//                     "name": "(GMT-07:00) Arizona"
//                 },
//                 {
//                     "value": "-6",
//                     "name": "(GMT-06:00) Central America"
//                 },
//                 {
//                     "value": "-5",
//                     "name": "(GMT-05:00) Eastern Time (US &amp; Canada)"
//                 },
//                 {
//                     "value": "-4",
//                     "name": "(GMT-04:00) Atlantic Time (Canada)"
//                 },
//                 {
//                     "value": "-3.5",
//                     "name": "(GMT-03:30) Newfoundland"
//                 },
//                 {
//                     "value": "-3",
//                     "name": "(GMT-03:00) Brasilia"
//                 },
//                 {
//                     "value": "-2",
//                     "name": "(GMT-02:00) Mid-Atlantic"
//                 },
//                 {
//                     "value": "-1",
//                     "name": "(GMT-01:00) Azores"
//                 },
//                 {
//                     "value": "0",
//                     "name": "(GMT+00:00) Greenwich Mean Time : Dublin, Edinburgh, Lisbon, London"
//                 },
//                 {
//                     "value": "1",
//                     "name": "(GMT+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna"
//                 },
//                 {
//                     "value": "2",
//                     "name": "(GMT+02:00) Jerusalem"
//                 },
//                 {
//                     "value": "3",
//                     "name": "(GMT+03:00) Moscow, St. Petersburg, Volgograd"
//                 },
//                 {
//                     "value": "3.5",
//                     "name": "(GMT+03:30) Tehran"
//                 },
//                 {
//                     "value": "4",
//                     "name": "(GMT+04:00) Abu Dhabi, Muscat"
//                 },
//                 {
//                     "value": "4.5",
//                     "name": "(GMT+04:30) Kabul"
//                 },
//                 {
//                     "value": "5",
//                     "name": "(GMT+05:00) Islamabad, Karachi, Tashkent"
//                 },
//                 // {
//                 //     "value": "5.5",
//                 //     "name": "(GMT+05:30) Sri Jayawardenapura"
//                 // },
//                 {
//                     "value": "5.5",
//                     "name": "(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi"
//                 },
//                 {
//                     "value": "5.75",
//                     "name": "(GMT+05:45) Kathmandu"
//                 },
//                 {
//                     "value": "6",
//                     "name": "(GMT+06:00) Astana, Dhaka"
//                 },
//                 {
//                     "value": "6.5",
//                     "name": "(GMT+06:30) Yangon (Rangoon)"
//                 },
//                 {
//                     "value": "7",
//                     "name": "(GMT+07:00) Bangkok, Hanoi, Jakarta"
//                 },
//                 {
//                     "value": "8",
//                     "name": "(GMT+08:00) Beijing, Chongqing, Hong Kong, Urumqi"
//                 },
//                 {
//                     "value": "9",
//                     "name": "(GMT+09:00) Osaka, Sapporo, Tokyo"
//                 },
//                 {
//                     "value": "9.5",
//                     "name": "(GMT+09:30) Adelaide"
//                 },
//                 {
//                     "value": "10",
//                     "name": "(GMT+10:00) Canberra, Melbourne, Sydney"
//                 },
//                 {
//                     "value": "11",
//                     "name": "(GMT+11:00) Magadan, Solomon Is., New Caledonia"
//                 },
//                 {
//                     "value": "12",
//                     "name": "(GMT+12:00) Fiji, Kamchatka, Marshall Is."
//                 },
//                 {
//                     "value": "13",
//                     "name": "(GMT+13:00) Nuku'alofa"
//                 }
//             ];
//         }]);
// })
// ();