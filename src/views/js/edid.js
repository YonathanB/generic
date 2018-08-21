/***********************************************
 * File Name:
 * Created by: Yonathan Benitah
 * On: 07/11/2016  11:30
 * Last Modified: 07/11/2016
 * Modified by: ybenitah
 ***********************************************/
(function () {
    function buf2hex(buffer) { // buffer is an ArrayBuffer
        return Array.prototype.map.call(
            new Uint8Array(buffer), function (x) {
                return ('00' + x.toString(16)).slice(-2);
            }).join('');
    }

    angular.module('web.controllers').factory('EDID_Obj', [
        '$http', 
        '$q', 
        'edidReaderServiceFactory',
        '$filter',
        'deviceModel',
        'K_Port',
        function ($http, $q, edidReaderServiceFactory, $filter, applicationService, K_Port) {
            var NUMBER_OF_INPUT = $filter('filter')(($filter('toArray')(deviceModel.portsList.getMatrixPorts().input)), {'masterSignal': 'VIDEO','selectedPort': true}).length;
            var NUMBER_OF_OUTPUT = $filter('filter')(($filter('toArray')(deviceModel.portsList.getMatrixPorts().output)), {'masterSignal': 'VIDEO','selectedPort': true}).length;

            var edidArr = [{
                "type": 0,
                "channels": []
            }, {
                "type": 1,
                "channels": []
            }, {
                "type": 2,
                "channels": []
            }];

            var _Edids = null;
            var _EdidReady = false;
            var _setEdid = function (toSet) {
                _Edids = toSet;
                _EdidReady = true;
            };
            var _initEDID = function () {
                _Edids = angular.copy(edidArr);
                var EDID_compt = 0;

                function loadEDID_File(fileType, idx, resolve) {

                    var filesIdx = {
                        "input": 0,
                        "output": 1,
                        "default": 2
                    };

                    var resolveFinally = function () {
                        if (EDID_toGet == ++EDID_compt)
                            deferred.resolve(_Edids);
                    };
                    var successCallback = function (data) {
                        edidReaderServiceFactory.loadFromData(buf2hex(data.data))
                            .then(function (parsedData) {
                                parsedData.deepColor = (!parsedData.deepColor) ? "" : "Deep Color: " + parsedData.deepColor;
                                parsedData.audio = parsedData.audioChannels;

                                _Edids[filesIdx[fileType]].channels[idx-1] = {
                                    channel: idx,
                                    data: parsedData
                                };
                                resolveFinally();
                            }, resolveFinally);
                    };
                    var errorCallback = function (data) {
                        _Edids[filesIdx[fileType]].channels[idx-1] =
                            {
                                channel: idx,
                                data: null
                            };
                        resolveFinally();
                    };
                    
                    if(resolve)
                        return errorCallback();
                    return $http.get('http://' + (isDebug ? debugURL : location.host) + '/edid/' + fileType + '_edid_' + idx + '_curr.bin', {responseType: "arraybuffer"})
                        .then(successCallback, errorCallback);
                }

                var deferred = $q.defer();
                var EDID_promises = {
                    "input": [],
                    "output": [],
                    "default": []
                };

                var EDID_toGet = 1;
                EDID_promises['default'][1] = loadEDID_File('default', 1);

                for (var i = 1; i <= NUMBER_OF_INPUT; i++) {
                    EDID_promises['input'][i] = loadEDID_File('input', i);
                    EDID_toGet++;
                }
                for (var i = 1; i <= NUMBER_OF_OUTPUT; i++) {
                    if($filter('filter')($filter('toArray')(deviceModel.portsList.getPortByIndex(i).output), {'masterSignal': 'VIDEO'})[0].signal) 
                        EDID_promises['output'][i] = loadEDID_File('output', i);
                    else
                        EDID_promises['output'][i] = loadEDID_File('output', i, true);
                    
                    EDID_toGet++;
                }
                return deferred.promise;
            };


            return {
                getEdid: function () {
                    return _Edids;
                },
                init: _initEDID,
                EdidReady: _EdidReady
            }
        }]);
    angular.module('web.controllers').controller('edidCtrl', [
        '$rootScope',
        '$scope',
        '$timeout',
        '$q',
        'communicationJsonManagerServiceFactory',
        'edidReaderServiceFactory',
        'fileTransferServiceFactory',
        'edidCollectorServiceFactory',
        '$log',
        'EDID_Obj',
        '$http',
        'deviceModel',
        'Commands', 'K_ProxyService', 'MessageService', '$filter',
        function ($rootScope,
                  $scope,
                  $timeout,
                  $q,
                  communicationJsonManagerServiceFactory,
                  edidReaderServiceFactory,
                  fileTransferServiceFactory,
                  edidCollectorServiceFactory,
                  $log, EDID_Obj, $http, applicationService, Commands, K_Proxy, MessageService, $filter) {
            $scope.accordionVisible = [];
            $scope.openAccordion = function (index) {
                for (var i = 0; i < $scope.accordionVisible.length; i++) {
                    $scope.accordionVisible[i] = false;
                }
                $scope.accordionVisible[index] = true;

                $scope.edidSelectFrom(index, 1)
            };
            $scope.accordionVisible[2] = true;
            $scope.edidCollectionObj = EDID_Obj.getEdid();
            var _FROM = ["INPUT", "OUTPUT", "DEFAULT", "FILE"];
            var NUMBER_OF_INPUT = $filter('filter')(($filter('toArray')(deviceModel.portsList.getMatrixPorts().input)), {'masterSignal': 'VIDEO','selectedPort': true}).length;
            var NUMBER_OF_OUTPUT = $filter('filter')(($filter('toArray')(deviceModel.portsList.getMatrixPorts().output)), {'masterSignal': 'VIDEO','selectedPort': true}).length;
            var DEFAULT_TYPE = 2;
            var DEFAULT_CHANNEL = 1;
            var FILE_TYPE = 3;
            var SUPPORT_EXTERNAL = false;
            var SUPPORT_INPUTLOCK = false;
            var SUPPORT_LABELS = false;
            var SELECT_ALL_INPUTS_TOGETHER = false;


            var SIGNAL_NONE = 0;
            var SIGNAL_WITHOUT_EDID = 1;
            var SIGNAL_WITH_EDID = 2;
            var INPUT = 0;
            var OUTPUT = 1;

            $scope.SUPPORT_EXTERNAL = SUPPORT_EXTERNAL;
            $scope.FILE_TYPE = FILE_TYPE;

            $scope.EDID = {
                "source": {"select": [[], [], [null, false], [null, false]]},
                "target": {"select": []},
                "dragAndDrop": {"source": null, "target": null}
            };

            for (var i = 1; i <= NUMBER_OF_INPUT; i++) {
                $scope.EDID.target.select[i] = false;
            }

            $scope.selectAllTarget = function (all) {
                for (var i = 1; i <= NUMBER_OF_INPUT; i++) {
                    $scope.EDID.target.select[i] = all;
                }
                $scope.edidReadyToCopy = all;
            };

            var displayEDID = function (type, channel) {

                if (type == FILE_TYPE) {
                    $scope.binaryDataArray = $scope.EDIDfile.data.binaryData;
                    $scope.binaryDataTitle = "FILE";
                }
                else if ($scope.edidCollectionObj[type].channels.length > 0) {
                    try {
                        var label = $scope.edidCollectionObj[type].channels[channel - 1].data.label;
                    }catch(e){
                        console.log('can not select EDID default' )
                    }
                    if (label && label != "") {
                        $scope.binaryDataTitle = label;
                    }
                    else {
                        $scope.binaryDataTitle = _FROM[type] + (type > 1 ? '' : ' ' + channel );
                    }
                    try {
                        $scope.binaryData = $scope.edidCollectionObj[type].channels[channel - 1].data.binaryData.join('');
                        $scope.binaryDataArray = $scope.edidCollectionObj[type].channels[channel - 1].data.binaryData;
                    }catch(e){
                        console.log('can not select EDID default')
                    }
                }
            };

            $scope.edidSelectFrom = function (type, channel) {
                displayEDID(type, channel);

                for (var i in $scope.EDID.source.select)
                    for (var j in $scope.EDID.source.select[i])
                        $scope.EDID.source.select[i][j] = false;
                $scope.EDID.source.select[type][channel] = true;
            };

            $scope.edidSelectFrom(DEFAULT_TYPE, 1);// select default EDID
            $scope.edidSelectTo = function (type, channel) {
                if (SELECT_ALL_INPUTS_TOGETHER) {
                    var newVal = !$scope.EDID.target.select[channel];

                    for (var i = 1; i < $scope.EDID.target.select.length; i++) {
                        $scope.EDID.target.select[i] = newVal;
                    }
                }
                else {
                    $scope.EDID.target.select[channel] = !$scope.EDID.target.select[channel]
                }
                //check box select all management
                var selectAllValue = true;
                var edidReadyToCopy = false;

                for (var i = 1; i < $scope.EDID.target.select.length; i++) {
                    if ($scope.EDID.target.select[i]) {
                        edidReadyToCopy = true;
                    }
                    else {
                        selectAllValue = false;
                    }
                }
                $scope.selectAllValue = selectAllValue;
                $scope.edidReadyToCopy = edidReadyToCopy;

            };


            $scope.updateUI = function (a,b,c) {
                console.log(a,b,c);
                $timeout(function () {
                    EDID_Obj.init().then(function (data) {
                        $scope.edidCollectionObj = data;
                    })
                }, 500);
            };
            $scope.uploadFileInProgress = false;

            $scope.EDIDfile = {};
            $scope.EDIDfile.fileText = "";
            $scope.EDIDfile.inputFileName = "Browse...";
            $scope.EDIDfile.edidFileToUpload = null;
            $scope.EDIDfile.data = {};
            $scope.EDIDfile.isReady = null;

            $scope.mainViewConfig.isTabFinishLoadingTemplate = true;
            // $scope.mainViewConfig.isLoading = true;
            $scope.edidReadyToCopy = false;
            $scope.edidWasCopiedShow = false;
            $scope.uploadFileInProgress = false;
            $scope.copyInProgress = false;
            $scope.selectAllValue = false;

            $scope.edidUploadDialog = false;//TODO Verify with Chezy
            $scope.uploadSafeMode = '0';//TODO Verify with Chezy


            $scope.edidCloseMessage = function () {
                $scope.edidWasCopiedShow = false;
                $scope.edidUploadError = false;
                $scope.edidFileUploadError = false;
                $scope.edidUploadDialog = false;
            };


            $scope.edidUploadEdidToDevice = function (edidSource, edidIndex, type, edidMask) {
                return deviceModel.updateDevice({
                    command: Commands.COPY_EDID,
                    value: edidSource + ',' + edidIndex + ',' + type + ',' + edidMask + (edidSource == 3 ? ',' + $scope.uploadSafeMode: '')
                });
            };


            var _edidFileFailed = function () {
                $scope.edidFileUploadError = true;
                for (var i in $scope.EDID.source.select)
                    for (var j in $scope.EDID.source.select[i])
                        $scope.EDID.source.select[i][j] = false;
                if (!$scope.EDIDfile.isReady) {
                    $scope.EDID.source.select[DEFAULT_TYPE][DEFAULT_CHANNEL] = true;
                }
                else {
                    $scope.EDID.source.select[FILE_TYPE][1] = true;
                }
                $timeout(function () {
                    $scope.inputFileName = "Browse...";
                });
                _onUploadEDID_Failed();
            };

            $scope.$watch('EDIDfile.fileText', function (newVal) {
                if ($scope.EDIDfile.fileText == "")//for trigger the file-text when the user upload the same file.
                    return;

                $scope.EDIDfile.fileText = "";
                if (newVal.byteLength > 1024)
                    _edidFileFailed();
                else
                    _checkEDID(newVal);
            });

            var _checkEDID = function (file) {
                var aByte, byteStr;
                var result = new Uint8Array(file);
                var edidText = "";
                for (var n = 0; n < result.length; ++n) {
                    aByte = result[n];
                    byteStr = aByte.toString(16);
                    if (byteStr.length < 2) {
                        byteStr = "0" + byteStr;
                    }
                    edidText += byteStr;
                }

                edidReaderServiceFactory.loadFromData(edidText).then(function (EdidObj) {
                    $scope.EDIDfile.isReady = true;
                    $scope.EDIDfile.data.model = EdidObj.model;
                    $scope.EDIDfile.data.res = EdidObj.res;
                    $scope.EDIDfile.data.deepColor = (!EdidObj.deepColor) ? "" : "Deep Color: " + EdidObj.deepColor;
                    $scope.EDIDfile.data.audio = EdidObj.audioChannels;
                    $scope.EDIDfile.data.edidLength = EdidObj.edidLength;
                    $scope.EDIDfile.data.binaryData = EdidObj.binaryData;

                    $scope.edidSelectFrom(FILE_TYPE, 1);
                    if (EdidObj.model !== "Invalid EDID")
                        $scope.edidFileLoaded(edidText);
                    else
                        _edidFileFailed();

                }, function (errorResponse) {

                });
            };

            var _onUploadEDID_Failed = function () {
                MessageService.newMessage({
                    title: 'EDID upload failed',
                    type: 'error',
                    isModal: true,
                    closeBtn: false,
                    body: '<p style="font-size: 14px; font-weight: bold">Error during EDID upload<br>' +
                    '<p >Please check if EDID file is correct.</p>',
                    buttons: [{
                        text: MessageService.button.ok,
                        onClick: function () {
                            angular.noop();
                        }
                    }]
                });
            };
            $scope.edidFileLoaded = function (file) {
                var data = {
                    "file": $scope.EDIDfile.edidFileToUpload
                };
                var fd = new FormData();
                angular.forEach(data, function (value, key) {
                    fd.append(key, value);
                });
                var url = 'http://' + (isDebug ? debugURL : location.host) + '/edid/upload';

                $http.post(url, fd, {
                    transformRequest: angular.identity,
                    headers: {'Content-Type': undefined}
                })
                    .success(function (data) {
                        if (data.success == 1) {
                            console.log('uploaded');
                        }
                        else
                            _onUploadEDID_Failed();
                    })
                    .error(function () {
                        console.log('EDID upload failed');
                        _onUploadEDID_Failed();

                    });
            };

            $scope.$on('$destroy', function () {
            });


            K_Proxy.moduleRegister($scope, {key: Commands.DISPLAY.key, refresh: $scope.updateUI});
            K_Proxy.moduleRegister($scope, {key: Commands.COPY_EDID.key, refresh: $scope.updateUI});
            K_Proxy.moduleRegister($scope, {key: Commands.LOAD_EDID.key, refresh: $scope.updateUI});
            K_Proxy.moduleRegister($scope, {key: Commands.EDID_DC.key, refresh: $scope.updateUI});
            K_Proxy.moduleRegister($scope, {key: Commands.EDID_CS.key, refresh: $scope.updateUI});
            K_Proxy.moduleRegister($scope, {key: Commands.EDID_AUDIO.key, refresh: $scope.updateUI});


//Drag & Drop Functions
            $scope.EDIDdragStart = function (edid, stopDrag) {
                if (stopDrag) {
                    edid.preventDefault();
                }
                else {
                    $scope.EDID.dragAndDrop.source = edid.currentTarget;
                }
            };

            $scope.EDIDdragEnter = function (edid) {
            };

            $scope.EDIDdragLeave = function (edid) {
            };

            $scope.EDIDdrop = function (edid) {
                var paramSource = [];
                var paramTarget = [];
                paramSource[0] = $scope.EDID.dragAndDrop.source;
                paramTarget[0] = edid.currentTarget;

                if (SELECT_ALL_INPUTS_TOGETHER) {
                    paramTarget = document.getElementsByClassName('EDID-to-list')[0].getElementsByClassName('kEdid');
                }
                else {
                    paramTarget = document.getElementsByClassName('EDID-to-list')[0].getElementsByClassName('active');
                }

                $scope.EDIDcopy(paramSource, paramTarget).then(function (json) {
                    $scope.edidUploadEdidToDevice(json.edidSource, json.edidIndex, 0, json.edidMask).then(function (data) {
                        EDID_Obj.init().then(function (data) {
                            $scope.edidCollectionObj = data;
                            $scope.edidWasCopiedShow = true;
                        })
                    });
                });

            };
            $scope.closeDialog = function () {
                $scope.edidWasCopiedShow = false;
            }
//////////////// Copy with animation /////////////////////////////////////////////////////////////
            $scope.EDIDcopy = function (aSource, aTarget) {
                var deferred = $q.defer();

                $scope.copyInProgress = true;

                if (aSource === undefined) {
                    aSource = $scope.EDID.dragAndDrop.source;
                }
                if (aTarget === undefined) {
                    aTarget = $scope.EDID.dragAndDrop.target;
                }

//For IE10 compatibility use getAttribute instead of dataset
                var edidSource = aSource[0].getAttribute('data-edid-type');
                var edidIndex = aSource[0].getAttribute('data-edid-channel');
                var edidTargets = 0;

                for (var i = 0; i < aTarget.length; i++) {
                    var current = aTarget[i];
                    edidTargets += Math.pow(2, parseInt(current.getAttribute('data-edid-channel')) - 1)
                }

                if (edidTargets > 0) {
                    var edidMask = '0x' + edidTargets.toString(16);

                    var timeDelay = 200;
                    var newDiv = [];

                    var move_edid = function (index) {
                        if (index == aTarget.length) {//End of animation
                            $timeout(function () {
                                var elements = document.getElementsByClassName('EDID-animation');
                                for (var j = 0; j < aTarget.length; j++) {
                                    elements[j].style.opacity = 0;
                                }
                                $timeout(function () {
                                    var elements = document.getElementsByClassName('EDID-animation');
                                    while (elements.length > 0) {
                                        elements[0].parentNode.removeChild(elements[0]);
                                    }
                                    $scope.copyInProgress = false;
                                }, 1200);
                                //End of all animation
                                deferred.resolve({
                                    "edidSource": edidSource,
                                    "edidIndex": edidIndex,
                                    "edidMask": edidMask
                                });

                            }, 1000);
                            return;
                        }
                        var target = aTarget[index];
                        $timeout(function () {

                            var position = target.getBoundingClientRect();
                            newDiv[index].style.top = position.top + 'px';
                            newDiv[index].style.left = position.left + 'px';

                            move_edid(++index);
                        }, timeDelay);
                    };

                    for (var i = 0; i < aTarget.length; i++) {
                        var target = aTarget[i];

                        //var newDiv = document.createElement("div");
                        newDiv[i] = aSource[0].cloneNode(true);
                        document.body.appendChild(newDiv[i]);

                        var positionSource = aSource[0].getBoundingClientRect();

                        newDiv[i].style.top = (positionSource.top) + 'px';
                        newDiv[i].style.left = (positionSource.left) + 'px';
                        //newDiv[i].style.top = (document.getElementById('mainDiv').offsetTop + aSource[0].offsetTop + aSource[0].offsetParent.offsetTop) + 'px';
                        //newDiv[i].style.left = (document.getElementById('mainDiv').offsetLeft + aSource[0].offsetLeft + aSource[0].offsetParent.offsetLeft) + 'px';

                        newDiv[i].classList.add('EDID-animation');
                    }

                    move_edid(0);


                }
                return deferred.promise;
            }

        }]);


    angular.module('web.controllers').directive("kEdidCopyButton", [
        'deviceModel',
        'EDID_Obj',
        '$exceptionHandler',
        function (applicationService, EDID_Obj, $exceptionHandler) {
            return {
                restrict: 'E',
                scope: {
                    enabled: '='
                },
                template: '\
            <k-button enabled="enabled" control-class="edidButton" text="Copy"\
            visible="true" click="startEDIDOperation();" title="Click to copy EDID to selected inputs"></k-button>{{edidWasCopiedShow}}',
                link: function (scope, element, attrs) {

                    scope.startEDIDOperation = function () {
                        scope.$parent.EDID.dragAndDrop.source = document.getElementsByClassName('EDID-from-list')[0].getElementsByClassName('active');
                        scope.$parent.EDID.dragAndDrop.target = document.getElementsByClassName('EDID-to-list')[0].getElementsByClassName('active');

                        if (scope.$parent.EDID.dragAndDrop.source.length === 0 || scope.$parent.EDID.dragAndDrop.target.length === 0) {
                            return;
                        }

                        scope.$parent.EDIDcopy().then(function (json) {
                            scope.$parent.edidUploadEdidToDevice(json.edidSource, json.edidIndex, 0, json.edidMask)
                                .then(function (data) {
                                    if (angular.isDefined(data.errCode)) {
                                        $exceptionHandler('EDID copy failed', {
                                            message: 'Error during EDID copy \nEDID file maybe invalid.',
                                            type: 'error',
                                            onClose: function () {
                                                angular.noop()
                                            }
                                        });
                                    }
                                    else {
                                        EDID_Obj.init().then(function (data) {
                                            scope.$parent.edidCollectionObj = data;
                                            scope.$parent.edidWasCopiedShow = true;
                                        });
                                    }
                                })
                        })
                    };
                }
            }
        }]);


})
();

