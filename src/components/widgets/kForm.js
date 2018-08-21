/***********************************************
 * File Name:
 * Created by: Yonathan Benitah
 * On: 06/12/2016  09:47
 * Last Modified: 06/12/2016
 * Modified by: ybenitah
 ***********************************************/




(function () {
    'ngInject'
    angular.module('components.widgets').directive("kForm", ['$parse', '$compile', '$timeout', function ($parse, $compile, $timeout) {
        var multicast_upper_pattern = "239.255.255.255";
        var multicast_lower_pattern = "224.0.0.0";
        var convertToBinary = function (address) {
            var splitAddress = address.split(".");
            var binaryString = "";
            for (var i = 0; i < splitAddress.length; i++) {
                binaryString += convertToBinaryFixedLength(splitAddress[i], 8);
            }
            return parseInt(binaryString, 2);
        };
        var convertToBinaryFixedLength = function (str, length) {
            var strToBinary = parseInt(str, 10).toString(2);
            return Array(length - strToBinary.length + 1).join("0") + strToBinary;
        };
        var validateIsNetwork = function (mask, ip) {
            var binaryIP = convertToBinary(ip);
            var binaryMask = convertToBinary(mask);
            return (0 == ((~binaryMask) & binaryIP));
        };
        var validateIsBroadcast = function (mask, ip) {
            var binaryIP = convertToBinary(ip);
            var binaryMask = convertToBinary(mask);
            return ((~binaryMask) == ((~binaryMask) & binaryIP));
        };
        var validateSameHostAddress = function (ip, gate, mask) {
            var binaryIP = convertToBinary(ip);
            var binaryMask = convertToBinary(mask);
            var binaryGate = convertToBinary(gate);
            return ((binaryIP & binaryMask) != (binaryGate & binaryMask));
        };
        var validateSameIP = function (ip, gate) {
            var binaryIP = convertToBinary(ip);
            var binaryGate = convertToBinary(gate);
            return (binaryIP !== binaryGate);
        };
        var validateIsLocalHost = function (address) {
            return parseInt(address.split('.')[0]) !== 127;
        };
        var validateIsMask = function (address) {
            var splitAddress = address.split('.');
            var binaryString = "";
            for (var i = 0; i < splitAddress.length; i++) {

                binaryString += convertToBinaryFixedLength(splitAddress[i], 8);
            }
            var isMask = true;
            var isZeroFlag = false;
            var binarySplit = binaryString.split('');
            for (var i = 0; i < binarySplit.length; i++) {
                if (binarySplit[i] == "1") {
                    if (isZeroFlag) {
                        isMask = false;
                        break;
                    }
                }
                else {
                    isZeroFlag = true;
                }
            }

            if (parseInt(binarySplit, 10) == 0)//all zero
            {
                isMask = false;
            }

            return !!isMask;

        };

        var validateIsMulticastReserved = function (address) {
            return !(parseInt(address.split('.')[0]) > 223);
        };

        var validateStreamingRecordingStatus = function (streamingStatus, recordingStatus) {
            //return true;
            return (parseInt(streamingStatus) + parseInt(recordingStatus)) > 0;
        };

        var validateMulticastGroupAddress = function (address) {
            var fromArr = multicast_lower_pattern.split(".");
            var toArr = multicast_upper_pattern.split(".");
            var group_address = address.split(".");
            for (var i = 0; i < 4; i++) {
                var currentFrom = parseInt(fromArr[i]);
                var currentTo = parseInt(toArr[i]);
                var currentAddress = parseInt(group_address[i]);
                if (currentFrom < currentAddress && currentAddress < currentTo) {
                    return true;
                }
                else if (currentFrom > currentAddress || currentAddress > currentTo) {
                    return false;
                }
            }
            return true;
        };

        var createCopyWithExcludedPropterties = function (obj, excludeFromCompare) {
            var currentDataCopy = JSON.parse(JSON.stringify(obj));
            if (excludeFromCompare) {
                for (var i in excludeFromCompare) {
                    delete currentDataCopy[excludeFromCompare[i]];
                }
            }
            return currentDataCopy;
        }

        var validateStreamingPort = function (portNumber) {
            return (portNumber == 554 || (portNumber >= 1024 && portNumber <= 65535));
        }

        function validateDeviceName(name) {
            var nameReg = /^(?!-)[0-9a-zA-Z-]*[0-9a-zA-Z]$/;
            return nameReg.test(name);
        }

        function validateRecordingURI(uri) {
            var uriReg = /^((smb|usb):\/\/)[0-9a-zA-Z-/_.]*$/;
            return uriReg.test(uri);
        }

        function validateDeviceTime(time) {
            var nameReg = /^(?!-)(?!.*-$)[a-zA-Z0-9-]+$/;
            return nameReg.test(name);
        }

        function validatePwd(name) {
            var nameReg = /^(?!-)(?!.*-$)[a-zA-Z0-9-]+$/;
            return nameReg.test(name);
        }

        function validatePwdLength(name) {
            return name.length < 16 && name.length > 4;
        }

        function validateStorageFilePrefix(prefix) {
            //var nameReg = /^(?:(?![:[\];|\\=,\/+*?<>#~@"])[ -~])$/i;///^(?!-)[0-9a-zA-Z-]*[0-9a-zA-Z-]$/;
            //var nameReg = /^[^\]\[;|\\=,\/+*?<>#~@"]$/i;
            var nameReg = /^(?!-)[0-9a-zA-Z-!$%&()+_=']*[0-9a-zA-Z-!$%&()+_=']$/;
            return nameReg.test(prefix);
        }

        function validateStorageFileLimit(limit) {
            var index = limit.indexOf("00:00:00");
            return index == -1;
        }

        function validateStorageFileDuration(limit) {
            var splitted_limit = limit.split(":");
            return (parseInt(splitted_limit[0]) > 0 || parseInt(splitted_limit[1]) >= 1);
        }

        function validateDeviceNameLength(name) {
            var validLength = 64;
            if (!isNaN(name[0])) {
                validLength = 62;
            }
            return name.length < validLength;
        }

        // function validateDeviceNameFirstChar(name){
        //     if(!isNaN(name[0]))
        //         return  name.length < 62;
        //     else
        //         return true;
        // }

        function validateStreamingFolderName(name) {
            var nameReg = /^\w+$/;
            return nameReg.test(name);
        }

        function validateEmptyField(value) {
            return value.trim() != "";
        }

        var generateRegularExpression = function (value) {
            var regExprString = "0-9";

            var regExpr = new RegExp("[^" + regExprString + "]", "g");
            return value.replace(regExpr, '');


        };

        var fieldToUpdate = [];
        var fieldsInForm = {};
        var formViewModel = {};
        var formModel = {};
        return {
            restrict: 'AE',
            require: ['?ngModel'],
            template: '<form name="form" class="page-content ">' +
            '<div style="text-align: right; padding: 10px 10px 0px;    color: #585858"> &nbsp;' +
            '<i ng-show="formHasChanged" class="icons icon-loop2" title="refresh data from device" style="cursor: pointer;" ' +
            'ng-click="resetData()"></div></i>' +
            '<ng-transclude></ng-transclude>' +
            '<div ng-messages="form.$error" role="alert" class="failed-to-save" style="width: 100%">' +
            '<div ng-message="distinct">Gateway and IP must be distinct</div>' +
            '<div ng-message="ip-mask">IP cannot be a mask address</div>' +
            '<div ng-message="ip-localhost">IP cannot be a localhost address range</div>' +
            '<div ng-message="ip-multicast">Invalid IP address (reserved address)</div>' +
            '<div ng-message="all-zero">Invalid IP address</div>' +
            '<div ng-message="ip-network">IP cannot be network address</div>' +
            '<div ng-message="ip-broadcast">IP cannot be broadcast address</div>' +
            '<div ng-message="mask">invalid Mask address</div>' +
            '<div ng-message="same-host">Gateway and IP must be in the same subnet</div>' +
            '<div ng-message="gateway-mask">Gateway cannot be a mask address</div>' +
            '<div ng-message="gateway-localhost">Gateway cannot be a localhost address range</div>' +
            '<div ng-message="gateway-multicast">Invalid Gateway address (reserved address)</div>' +
            '<div ng-message="gateway-network">Gateway cannot be network address</div>' +
            '<div ng-message="gateway-broadcast">Gateway cannot be broadcast address</div>' +
            '<div ng-message="failed-on-save">{{errorMsg}}</div>' +
            '<div ng-message="device-name">Device name should be alphanumeric</div>' +
            '<div ng-message="storage-file-prefix" >File prefix should be alphanumeric and could contain special characters: -!$%&()+_=\'</div>' +
            '<div ng-message="storage-file-limit">Storage file time limit can\'t be 00:00:00</div>' +
            '<div ng-message="storage-file-duration">Recording time duration should be at least 1 minute</div>' +
            '<div ng-message="streaming-folder-name">Streaming folder name should be alphanumeric</div>' +
            '<div ng-message="streaming-port">Streaming port should be 554 or between 1024 and 65535</div>' +
            '<div ng-message="recording-uri">Invalid URI</div>' +
            // '<div ng-message="first-device-name">Device name\'s first character must be a letter</div>' +
            '<div ng-message="device-name-length">Device name must be less than 64 characters</div>' +
            // '<div ng-message="device-name-first-char">If first char in device name is number, "K-" will be added </div>' +
            '<div ng-message="tcp-empty">TCP port can not be empty</div>' +
            '<div ng-message="multicast-group-address">Group address should be between ' + multicast_upper_pattern + ' and ' + multicast_lower_pattern + ' </div>' +
            '<div ng-message="streaming-recording-status">At least one of the features, Streaming or Recording, should be enabled.</div>' +
            '</div>' +
            '<div >' +
            '<button class="btn default" ng-class="{\'disabled\': !formHasChanged || !form.$valid}" type="submit" ' +
            'style="">' +
            '<div id="saveLabel" style="width: 100%" >Save </div> ' +
            '<div class="loader-btn" ng-if="saveProcess" style="position: absolute; margin-left: 50px"/>' +
            '</button> </div></form>',


            transclude: true,
            scope: {
                dataSource: '=ngModel',
                // callOnSaved: '&', rename to kOnSubmit
                kOnSubmit: '=',
                callOnBeforeSaved: '&',
                callBeforeDestroy: '&',
                excludeFromCompare: '=',
                control: '=?'
            },
            controller: function ($scope) {
                fieldToUpdate = [];
                $scope.submitForm = function () {
                    if ($scope.form.$valid) {
                        $scope.kOnSubmit({formViewModel, fieldToUpdate});
                    }
                };


            },
            link: function (scope, $element, attrs) {


                let onDataChangedInDevice;


                scope.internalControl = scope.control || {};
                var $element = $element;


                var DATA_CHANGED_IN_DEVICE = true;

                let $inputElements = $element.find('input');
                fieldsInForm = {}; // declaration outside link function (in directive)
                for (var input in $inputElements.toArray()) {
                    let $el = $inputElements[input];
                    let property = $el.name;
                    fieldsInForm[property] = $el;
                    formModel[property] = scope.dataSource[property] || '';
                    //  detect changes from view
                    angular.element($el).on('keyup blur change', function (event) {//TODO - check why do we need such a lot triggers
                        DATA_CHANGED_IN_DEVICE = false;
                        dataChanged(event.target.name);
                        $timeout.cancel(onDataChangedInDevice);
                    });
                }


                function dataChanged(property) {
                    // if (!DATA_CHANGED_IN_DEVICE) {
                    formViewModel[property] = fieldsInForm[property].value;
                    if (formViewModel[property] !== formModel[property]) {
                        if (fieldToUpdate.indexOf(property) === -1)
                            fieldToUpdate.push(property);
                    } else if (fieldToUpdate.indexOf(property) > -1)
                        fieldToUpdate.splice(fieldToUpdate.indexOf(property), 1);


                    // $timeout(function () {
                    // checkValidity(prop);
                    // if (prop) {
                    //     let changeDetected = (fieldsInForm[prop] != scope.form.$$element.find('input[name="' + prop + '"]').val());
                    //     if (changeDetected && fieldToUpdate.indexOf(prop) === -1)
                    //         fieldToUpdate.push(prop);
                    //     else if (!changeDetected && fieldToUpdate.indexOf(prop) > -1)
                    //         fieldToUpdate.splice(fieldToUpdate.indexOf(prop), 1);
                    // }
                    // checkIfDataHasChanged();
                    // // }, 0);
                    // return;
                    // } else fieldToUpdate = [];
                    checkIfDataHasChanged();
                    scope.$applyAsync();
                }


                //  detect changes from device, other changes will be detected by input's event listener
                scope.$watch('dataSource',
                    function (newVal, oldVal) {
                        onDataChangedInDevice = $timeout(//force scope to be launch with a delay in order to prevent this function to be called on user input
                            function () {
                                for (var prop in fieldsInForm) {
                                    if (newVal[prop] && oldVal[prop])
                                        if (newVal[prop] !== formViewModel[prop]) {
                                            formViewModel[prop] = formModel[prop] = newVal[prop];
                                            DATA_CHANGED_IN_DEVICE = true;
                                            dataChanged(prop);
                                        }
                                }
                                checkIfDataHasChanged();
                            }, 200)
                    }, true);


                scope.resetData = function () {
                    console.log('REVERT CHANGES KFORM');
                    for (var prop in fieldsInForm) {
                        if (scope.dataSource.hasOwnProperty(prop))
                            scope.dataSource[prop] = formModel[prop];
                        formViewModel[prop] = fieldsInForm[prop].value = formModel[prop];//revert viewModel
                        dataChanged(prop);
                    }
                }


                function checkValidity() {
                    if (scope.form.hasOwnProperty('multicast_group_address')) {
                        scope.form.multicast_group_address.$setValidity('multicast-group-address', validateMulticastGroupAddress(scope.form.multicast_group_address.$viewValue));
                    }

                    if (scope.form.hasOwnProperty('streaming_port')) {
                        scope.form.streaming_port.$setValidity('streaming-port', validateStreamingPort(scope.form.streaming_port.$viewValue));
                    }

                    if (scope.form.hasOwnProperty('storage_file_prefix')) {
                        scope.form.storage_file_prefix.$setValidity('storage-file-prefix', validateStorageFilePrefix(scope.form.storage_file_prefix.$viewValue));
                    }

                    if (scope.form.hasOwnProperty('device_hour')) {
                        scope.form.device_hour.$setValidity('device-hour', validateEmptyField(scope.form.device_hour.$viewValue));
                    }

                    if (scope.form.hasOwnProperty('device_minute')) {
                        scope.form.device_minute.$setValidity('device_minute-hour', validateEmptyField(scope.form.device_minute.$viewValue));
                    }

                    if (scope.form.hasOwnProperty('storage_file_limit')) {
                        scope.form.storage_file_limit.$setValidity('storage-file-limit', validateStorageFileLimit(scope.form.storage_file_limit.$viewValue));
                    }

                    if (scope.form.hasOwnProperty('recording_uri')) {
                        scope.form.recording_uri.$setValidity('recording-uri', validateRecordingURI(scope.form.recording_uri.$viewValue));
                    }

                    if (scope.form.hasOwnProperty('storage_file_duration')) {
                        scope.form.storage_file_duration.$setValidity('storage-file-duration', validateStorageFileDuration(scope.form.storage_file_duration.$viewValue));
                    }

                    if (scope.form.hasOwnProperty('streaming_folder_name')) {
                        scope.form.streaming_folder_name.$setValidity('streaming-folder-name', validateStreamingFolderName(scope.form.streaming_folder_name.$viewValue));
                    }

                    if (scope.form.hasOwnProperty('streaming_status') && scope.form.hasOwnProperty('recording_status')) {
                        scope.form.streaming_status.$setValidity('streaming-recording-status',
                            validateStreamingRecordingStatus(scope.form.streaming_status.$viewValue, scope.form.recording_status.$viewValue));
                    }

                    // if (scope.form.hasOwnProperty('ip')) {
                    //     scope.form.ip.$setValidity('ip-localhost', validateIsLocalHost(scope.form.ip.$viewValue));
                    //     scope.form.ip.$setValidity('ip-multicast', validateIsMulticastReserved(scope.form.ip.$viewValue));
                    // }

                    if (scope.form.hasOwnProperty('dns_primary')) {
                        scope.form.dns_primary.$setValidity('ip-localhost', validateIsLocalHost(scope.form.dns_primary.$viewValue));
                        //scope.form.dns.$setValidity('ip-multicast', validateIsMulticastReserved(scope.form.dns.$viewValue));
                    }
                    // if (scope.form.hasOwnProperty('mask')) {
                    //     scope.form.mask.$setValidity('mask', validateIsMask(scope.form.mask.$viewValue));
                    //     if (scope.form.hasOwnProperty('ip')) {
                    //         scope.form.ip.$setValidity('ip-network', !validateIsNetwork(scope.form.mask.$viewValue, scope.form.ip.$viewValue));
                    //         scope.form.ip.$setValidity('ip-broadcast', !validateIsBroadcast(scope.form.mask.$viewValue, scope.form.ip.$viewValue));
                    //     }
                    //     if (scope.form.hasOwnProperty('gateway')) {
                    //         scope.form.gateway.$setValidity('gateway-network', !validateIsNetwork(scope.form.mask.$viewValue, scope.form.gateway.$viewValue));
                    //         scope.form.gateway.$setValidity('gateway-broadcast', !validateIsBroadcast(scope.form.mask.$viewValue, scope.form.gateway.$viewValue));
                    //     }
                    //     if (scope.form.hasOwnProperty('tcp'))
                    //         scope.form.tcp.$setValidity('tcp-empty', function () {
                    //             return scope.form.tcp.$viewValue.trim() !== "" && !scope.form.tcp.$viewValue.match(/[a-z]/g)
                    //         }());
                    //
                    //     if (scope.form.hasOwnProperty('ip') && scope.form.hasOwnProperty('gateway')) {
                    //         scope.form.ip.$setValidity('same-host', !validateSameHostAddress(scope.form.ip.$viewValue, scope.form.gateway.$viewValue, scope.form.mask.$viewValue));
                    //         scope.form.gateway.$setValidity('distinct', validateSameIP(scope.form.ip.$viewValue, scope.form.gateway.$viewValue));
                    //         scope.form.ip.$setValidity('distinct', validateSameIP(scope.form.ip.$viewValue, scope.form.gateway.$viewValue));
                    //     }
                    // }


                    if (scope.form.hasOwnProperty('deviceName')) {
                        if (scope.form.deviceName.$dirty && scope.form.deviceName.$viewValue != '') {
                            if (scope.form.deviceName.$viewValue.length == 1 && scope.form.deviceName.$viewValue == 1)
                                scope.form.deviceName.$modelValue = 'K_1';
                            scope.form.deviceName.$setValidity('device-name', validateDeviceName(scope.form.deviceName.$viewValue));
                            // scope.form.deviceName.$setValidity('first-device-name', validateFirstLetterDeviceName(scope.form.deviceName.$viewValue));
                            scope.form.deviceName.$setValidity('device-name-length', validateDeviceNameLength(scope.form.deviceName.$viewValue));
                            // scope.form.deviceName.$setValidity('device-name-first-char', validateDeviceNameFirstChar(scope.form.deviceName.$viewValue));
                        }
                    }
                    scope.$applyAsync();
                };

                function checkIfDataHasChanged() {
                    scope.formHasChanged = (fieldToUpdate.length > 0);
                }

                scope.submitButton = $element.find('button[type="submit"]');
                scope.submitButton.click(function (event) {
                    scope.submitForm();
                });


                // var init = function () {
                //     var timeoutPromise;
                //     var delayInMs = 1700;
                //     scope.$watch("dataSource.data", function(newVal) {
                //         _DATA_CHANGED_FROM_OUTSIDE = true;
                //         $timeout.cancel(timeoutPromise);  //does nothing, if timeout already done
                //         timeoutPromise = $timeout(function(){   //Set timeout
                //             test(newVal);
                //             console.info('ENTERING CHANGE')
                //         },delayInMs);
                //     }, true);
                //
                //
                //     scope.formHasChanged = false;
                //     scope.submitButton = $element.find('button[type="submit"]');
                //     scope.dataBeforeChanges = createCopyWithExcludedPropterties(scope.dataSource.data, scope.excludeFromCompare);
                //
                //     var TCP_elem = $element.find('input[name="tcp"]');
                //     TCP_elem.on('keydown', function (event) {
                //         $timeout(function () {
                //             TCP_elem.val(generateRegularExpression(TCP_elem.val()));
                //             _refreshForm();
                //         }, 0);
                //     });
                //
                //     var _refreshModel = function(){
                //         scope.dataBeforeChanges = createCopyWithExcludedPropterties(scope.dataSource.data, scope.excludeFromCompare);
                //         _refreshForm();
                //     }
                //
                //     var _refreshForm = function () {
                //     if (!scope.form)
                //         return;
                //     $timeout(function () { // to have view updated
                //
                //         if (scope.form.hasOwnProperty('multicast_group_address')) {
                //             scope.form.multicast_group_address.$setValidity('multicast-group-address', validateMulticastGroupAddress(scope.form.multicast_group_address.$viewValue));
                //         }
                //
                //         if (scope.form.hasOwnProperty('streaming_port')) {
                //             scope.form.streaming_port.$setValidity('streaming-port', validateStreamingPort(scope.form.streaming_port.$viewValue));
                //         }
                //
                //         if (scope.form.hasOwnProperty('storage_file_prefix')) {
                //             scope.form.storage_file_prefix.$setValidity('storage-file-prefix', validateStorageFilePrefix(scope.form.storage_file_prefix.$viewValue));
                //         }
                //
                //         if (scope.form.hasOwnProperty('device_hour')) {
                //             scope.form.device_hour.$setValidity('device-hour', validateEmptyField(scope.form.device_hour.$viewValue));
                //         }
                //
                //         if (scope.form.hasOwnProperty('device_minute')) {
                //             scope.form.device_minute.$setValidity('device_minute-hour', validateEmptyField(scope.form.device_minute.$viewValue));
                //         }
                //
                //         if (scope.form.hasOwnProperty('storage_file_limit')) {
                //             scope.form.storage_file_limit.$setValidity('storage-file-limit', validateStorageFileLimit(scope.form.storage_file_limit.$viewValue));
                //         }
                //
                //         if (scope.form.hasOwnProperty('recording_uri')) {
                //             scope.form.recording_uri.$setValidity('recording-uri', validateRecordingURI(scope.form.recording_uri.$viewValue));
                //         }
                //
                //         if (scope.form.hasOwnProperty('storage_file_duration')) {
                //             scope.form.storage_file_duration.$setValidity('storage-file-duration', validateStorageFileDuration(scope.form.storage_file_duration.$viewValue));
                //         }
                //
                //         if (scope.form.hasOwnProperty('streaming_folder_name')) {
                //             scope.form.streaming_folder_name.$setValidity('streaming-folder-name', validateStreamingFolderName(scope.form.streaming_folder_name.$viewValue));
                //         }
                //
                //         if (scope.form.hasOwnProperty('streaming_status') && scope.form.hasOwnProperty('recording_status')) {
                //             scope.form.streaming_status.$setValidity('streaming-recording-status',
                //                 validateStreamingRecordingStatus(scope.form.streaming_status.$viewValue, scope.form.recording_status.$viewValue));
                //         }
                //
                //         if (scope.form.hasOwnProperty('ip')) {
                //             scope.form.ip.$setValidity('ip-localhost', validateIsLocalHost(scope.form.ip.$viewValue));
                //             scope.form.ip.$setValidity('ip-multicast', validateIsMulticastReserved(scope.form.ip.$viewValue));
                //         }
                //
                //         if (scope.form.hasOwnProperty('dns_primary')) {
                //             scope.form.dns_primary.$setValidity('ip-localhost', validateIsLocalHost(scope.form.dns_primary.$viewValue));
                //             //scope.form.dns.$setValidity('ip-multicast', validateIsMulticastReserved(scope.form.dns.$viewValue));
                //         }
                //         if (scope.form.hasOwnProperty('mask')) {
                //             scope.form.mask.$setValidity('mask', validateIsMask(scope.form.mask.$viewValue));
                //             if (scope.form.hasOwnProperty('ip')) {
                //                 scope.form.ip.$setValidity('ip-network', !validateIsNetwork(scope.form.mask.$viewValue, scope.form.ip.$viewValue));
                //                 scope.form.ip.$setValidity('ip-broadcast', !validateIsBroadcast(scope.form.mask.$viewValue, scope.form.ip.$viewValue));
                //             }
                //             if (scope.form.hasOwnProperty('gateway')) {
                //                 scope.form.gateway.$setValidity('gateway-network', !validateIsNetwork(scope.form.mask.$viewValue, scope.form.gateway.$viewValue));
                //                 scope.form.gateway.$setValidity('gateway-broadcast', !validateIsBroadcast(scope.form.mask.$viewValue, scope.form.gateway.$viewValue));
                //             }
                //             if(scope.form.hasOwnProperty('tcp'))
                //                 scope.form.tcp.$setValidity('tcp-empty', function(){ return scope.form.tcp.$viewValue.trim() !== "" && !scope.form.tcp.$viewValue.match(/[a-z]/g)}());
                //
                //             if (scope.form.hasOwnProperty('ip') && scope.form.hasOwnProperty('gateway')) {
                //                 scope.form.ip.$setValidity('same-host', !validateSameHostAddress(scope.form.ip.$viewValue, scope.form.gateway.$viewValue, scope.form.mask.$viewValue));
                //                 scope.form.gateway.$setValidity('distinct', validateSameIP(scope.form.ip.$viewValue, scope.form.gateway.$viewValue));
                //                 scope.form.ip.$setValidity('distinct', validateSameIP(scope.form.ip.$viewValue, scope.form.gateway.$viewValue));
                //             }
                //         }
                //
                //
                //         if (scope.form.hasOwnProperty('deviceName')) {
                //             if (scope.form.deviceName.$dirty && scope.form.deviceName.$viewValue != '') {
                //                 if (scope.form.deviceName.$viewValue.length == 1 && scope.form.deviceName.$viewValue == 1)
                //                     scope.form.deviceName.$modelValue = 'K_1';
                //                 scope.form.deviceName.$setValidity('device-name', validateDeviceName(scope.form.deviceName.$viewValue));
                //                 // scope.form.deviceName.$setValidity('first-device-name', validateFirstLetterDeviceName(scope.form.deviceName.$viewValue));
                //                 scope.form.deviceName.$setValidity('device-name-length', validateDeviceNameLength(scope.form.deviceName.$viewValue));
                //                 // scope.form.deviceName.$setValidity('device-name-first-char', validateDeviceNameFirstChar(scope.form.deviceName.$viewValue));
                //             }
                //         }
                //
                //         if (scope.form.hasOwnProperty('currentPassword')) {
                //             if ((scope.form.currentPassword.$dirty && scope.form.currentPassword.$viewValue != '')
                //                 || (scope.form.newPassword.$dirty && scope.form.newPassword.$viewValue != '')
                //                 || (scope.form.confirmPassword.$dirty && scope.form.confirmPassword.$viewValue != '')) {
                //                 scope.form.newPassword.$setValidity('password-length', true);
                //                 scope.form.confirmPassword.$setValidity('confirm-password', true);
                //                 scope.form.$setValidity('password', scope.form.currentPassword.$viewValue != '' && scope.form.confirmPassword.$viewValue != '' &&
                //                     angular.isDefined(scope.form.newPassword.$viewValue) && scope.form.confirmPassword.$viewValue == scope.form.newPassword.$viewValue);
                //                 if (angular.isDefined(scope.form.newPassword.$viewValue) && scope.form.newPassword.$viewValue != '') {
                //                     scope.form.newPassword.$setValidity('password-length', validatePwdLength(scope.form.newPassword.$viewValue));
                //                     scope.form.newPassword.$setValidity('password-pattern', validatePwd(scope.form.newPassword.$viewValue));
                //                 }
                //                 if (scope.form.confirmPassword.$dirty && scope.form.confirmPassword.$viewValue != '') {
                //                     scope.form.confirmPassword.$setValidity('confirm-password', scope.form.confirmPassword.$viewValue == scope.form.newPassword.$viewValue);
                //
                //
                //                     scope.form.confirmPassword.$setValidity('current-password-not-empty', !(scope.form.confirmPassword.$viewValue != '' && scope.form.newPassword.$viewValue != '' && scope.form.currentPassword.$viewValue == ''));
                //                 }
                //             }
                //             else if (scope.form.$error['password-length'] || scope.form.$error['password'] || scope.form.$error['confirm-length']) {
                //                 scope.form.$setValidity('password', true);
                //                 scope.form.newPassword.$setValidity('password-length', true);
                //                 scope.form.confirmPassword.$setValidity('confirm-password', true);
                //             }
                //
                //         }
                //         scope.form.$setValidity('failed-on-save', true);
                //
                //         scope.formHasChanged = !angular.equals(scope.dataBeforeChanges, createCopyWithExcludedPropterties(scope.dataSource.data, scope.excludeFromCompare));
                //         if(scope.formHasChanged)
                //             _DATA_CHANGED_FROM_OUTSIDE = false;
                //     }, 0);
                // };
                //     scope.internalControl.refresh = _refreshForm;
                //     scope.internalControl.refreshModel = _refreshModel;

                //     scope.saveProcess = false;
                //     scope.submitButton.click(function (event) {
                //         if (!scope.formHasChanged)
                //             return;
                //         scope.saveProcess = true;
                //         scope.update_success = true;
                //         if (angular.isDefined(scope.callOnBeforeSaved))
                //             scope.callOnBeforeSaved({data: scope.dataSource.data, before: scope.dataBeforeChanges});
                //         scope.dataSource.update(scope.dataSource.data)
                //             .then(function (data) {
                //                 scope.dataBeforeChanges = createCopyWithExcludedPropterties(data.obj.data, scope.excludeFromCompare);
                //                 scope.formHasChanged = false;
                //                 scope.saveProcess = false;
                //                 scope.errorMsg = '';
                //                 for (var i = 0; data.data.length > i; i++) {
                //                     if (angular.isDefined(data.data[i].errCode)) {
                //                         scope.form.$setValidity('failed-on-save', false);
                //                         scope.errorMsg += 'Failed to update ' + data.data[i].cmd.name + '\n';
                //                         scope.update_success = false;
                //                     }
                //                 }
                //                 if (angular.isDefined(scope.callOnSaved))
                //                     scope.callOnSaved({data: data, update_success:scope.update_success});
                //             }, function (err) {
                //                 console.log('UPDATE FAILED', err);
                //                 scope.saveProcess = false;
                //
                //             })
                //     });
                //
                //
                //     scope.resetData = function () {
                //         // scope.saveProcess = true;
                //         scope.dataSource.init(true).then(function (data) {
                //             if (data) {
                //                 _refreshForm();
                //                 scope.formHasChanged = false; // force dorm to not beeing changed
                //                 if(typeof scope.internalControl == 'function')
                //                     scope.internalControl();
                //
                //             }
                //         }, function (data) {
                //             console.log('RESTORE DATA FAILED');
                //             // scope.saveProcess = false;
                //         })
                //
                //
                //     };
                //
                //     scope.$on("$destroy", function () {
                //         if (angular.isDefined(scope.callBeforeDestroy))
                //             scope.callBeforeDestroy();
                //         if (!angular.equals(scope.dataBeforeChanges, createCopyWithExcludedPropterties(scope.dataSource.data, scope.excludeFromCompare)))
                //             scope.resetData();
                //
                //     });
                //
                //
                // }
                // init();
            }
        };
    }])
})();
