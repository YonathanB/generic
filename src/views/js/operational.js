(function () {
    var KApp = angular.module('web.controllers')
        .controller('kdsCtrl', ['$rootScope', '$scope', function($rootScope, $scope){
            $scope.isEncoder = ($rootScope.deviceDescriptor.deviceType === 'Streaming Encoder');
        }])

    KApp.controller('operationalConfigurationCtrl', [
        '$scope',
        'deviceModel',
        'Commands',
        'operationalConfiguration',
        // 'authentication',
        '$timeout',
        function ($scope, applicationStarter, Commands, model, $timeout) {
            $scope.errorUpdateMessage = "";
            $scope.showErrorOnUpdate = false;
            $scope.warningMode = '';
            $scope.warningModes=[{id:0, name:"scaling"}, {id:1, name:"audio"}];
            $scope.warningMessages = [{"title": "Would you like to change the Scale Mode to scaling?", "message" : "After this action, current WEB session may be disconnected."},
                {"title" : "Would you like to change the Audio Mode?","message" : "This change will only take effect after the device power cycle."}];
            $scope.warningMessageTitle;
            $scope.warningMessage;
            var encoding_methods=[{id:0, name:"H.264"}];//,{id:1,name:'MJPEG'}];
            var audio_modes_enc = [{id:0, name:"HDMI input"},{id:1, name: "Analog input"},{id:2, name:"None"}];
            var audio_modes_dec = [{id:0, name:"HDMI output"},{id:1, name: "Analog output"},{id:2, name:"Both"}, {id:3, name:"None"}];
            var working_modes = [{id:3, name:"High Quality"}];
            var scale_modes = [{id:0, name:"Pass through"},{id:1, name:"Scaling"}];
            $scope.excludeFromCompare = ['SCALE_PARAMS'];

            $scope.operationalConfigurationSettings = model;

            //$scope.generalSettings.STREAMER_ACTION = $scope.operationalSettings.data.STREAMER_ACTION;
            //$scope.operationalGeneralSettings.data.STREAMER_ENCODING_METHOD = parseInt($scope.operationalGeneralSettings.data.STREAMER_ENCODING_METHOD);
            $scope.operationalConfigurationSettings.encodingMethods = encoding_methods;
            if($scope.isEncoder) {
                $scope.operationalConfigurationSettings.audio_modes = audio_modes_enc;
            }
            else{
                $scope.operationalConfigurationSettings.audio_modes = audio_modes_dec;
            }
            //$scope.operationalGeneralSettings.data.AUDIO_SRC_DEST = parseInt($scope.operationalGeneralSettings.data.AUDIO_SRC_DEST);
            //$scope.audioMode = parseInt($scope.operationalSettings.data.AUDIO_SRC_DEST);
            //$scope.operationalGeneralSettings.data.LATENCY = parseInt($scope.operationalGeneralSettings.data.LATENCY);
            //$scope.operationalGeneralSettings.data.FRAMERATE = parseInt($scope.operationalGeneralSettings.data.FRAMERATE);
            $scope.operationalConfigurationSettings.modes = working_modes;
            $scope.operationalConfigurationSettings.scale_modes = scale_modes;
            $scope.operationalConfigurationSettings.data.SCALE_PARAMS = angular.copy($scope.operationalConfigurationSettings.data.SCALE_PARAMS);
            if($scope.operationalConfigurationSettings.data.SCALE_PARAMS && $scope.operationalConfigurationSettings.data.SCALE_PARAMS.mode) {
                $scope.operationalConfigurationSettings.scaleMode = parseInt($scope.operationalConfigurationSettings.data.SCALE_PARAMS.mode);
            }
            //$scope.operationalGeneralSettings.data.STREAMER_WORKING_MODE = parseInt($scope.operationalGeneralSettings.data.STREAMER_WORKING_MODE);


            $scope.changeStartStop = function()
            {
                $scope.operationalConfigurationSettings.data.STREAMER_ACTION == 0 ? ($scope.operationalConfigurationSettings.data.STREAMER_ACTION = 1) : $scope.operationalConfigurationSettings.data.STREAMER_ACTION = 0;
            };


            $scope.CallOnSaved = function(insideVal, update_success)
            {
                if(update_success) {
                    deviceModel.updateDevice({
                        command: Commands.STREAMER_ACTION,
                        value: '2'
                    }).then(function (data) {
                        }
                    );
                }
                if($scope.operationalConfigurationSettings.data.STREAMER_ENCODING_METHOD == 0 && $scope.isEncoder) {
                    deviceModel.send([Commands.BITRATE]).then(function (data) {
                        $scope.operationalConfigurationSettings.data.BITRATE = data[0].value;
                    });

                    deviceModel.send([Commands.GOP_SIZE]).then(function (data) {
                        $scope.operationalConfigurationSettings.data.GOP_SIZE = data[0].value;
                    });
                }
            };


            $scope.CallOnBeforeSaved = function(){
                if(!$scope.isEncoder) {
                    if ($scope.operationalConfigurationSettings.data.SCALE_PARAMS) {
                        $scope.operationalConfigurationSettings.data.SCALE_PARAMS.toString = function () {
                            return this.mode;
                        };
                    }
                }

            };

            $scope.toggleSpecialModes = function(val, mode){
                $scope.warningMessageTitle = $scope.warningMessages[0].title;
                $scope.warningMessage = $scope.warningMessages[0].message;
                if(mode == 0 && val == 0)
                {
                    deviceModel.updateDevice({
                        command: Commands.SCALE_PARAMS,
                        value: '0'
                    }).then(function(data) {
                            if (data.value) {
                                $scope.operationalConfigurationSettings.scaleMode = parseInt(data.value);
                            }
                            else if(data.errCode){
                                showUpdateErrorMessage(data);
                            }
                        }
                    );
                }
                else if(mode == 1 && !$scope.isEncoder)
                {
                    deviceModel.updateDevice({
                        command: Commands.AUDIO_SRC_DEST,
                        value: val
                    }).then(function(data){
                            if(data.value) {
                                $scope.audioMode = parseInt(data.value);
                            }
                            else if(data.errCode){
                                showUpdateErrorMessage(data);
                            }
                        }
                    );
                }
                else
                {
                    if(mode)
                    {
                        $scope.warningMode = mode;
                        $scope.warningMessageTitle = $scope.warningMessages[mode].title;
                        $scope.warningMessage = $scope.warningMessages[mode].message;

                    }
                    $scope.inWarningMode = !$scope.inWarningMode;
                }
            };

            $scope.proceedSave = function(){
                $scope.inWarningMode = false;
                if($scope.warningMode == 0)
                {
                    deviceModel.updateDevice({
                        command: Commands.SCALE_PARAMS,
                        value: '1'
                    }).then(function(data){
                            if(data.value) {
                                $scope.operationalConfigurationSettings.scaleMode = parseInt(data.value);
                            }
                            else if(data.errCode){
                                showUpdateErrorMessage(data);
                            }
                        }
                    );
                    $scope.$root.enableLocalLoader();
                    $timeout(function () {
                        location.reload();
                    }, 1000 * 30);
                }
                else
                {
                    deviceModel.updateDevice({
                        command: Commands.AUDIO_SRC_DEST,
                        value: $scope.operationalConfigurationSettings.data.AUDIO_SRC_DEST
                    }).then(function(data){
                            if(data.value) {
                                $scope.audioMode = parseInt(data.value);
                            }
                            else if(data.errCode){
                                showUpdateErrorMessage(data);
                            }
                        }
                    );
                }

            };

            var showUpdateErrorMessage = function(data){
                $scope.errorUpdateMessage = buildErrorMessage(data);
                $scope.showErrorOnUpdate = true;
                $timeout(function () {
                    $scope.showErrorOnUpdate = false;
                }, 2000);
            };

            var buildErrorMessage = function(data){
                if(data && data.cmd && data.cmd.key)
                    return "Failed to update " + data.cmd.name;
                else
                    return "Failed to update " ;
            };

        }]);

    KApp.controller('operationalGeneralCtrl', [
        '$scope',
        'deviceModel',
        'Commands',
        'streamingOperationalGeneralSettings',
        // 'authentication',
        '$timeout',
        function ($scope, applicationStarter, Commands, model, $timeout) {

            $scope.recording_operational_statuses =
                {0: {name:"Running"},
                1: {name:"Stopped"},
                2: {name:"Error - Read only File System"},
                3: {name:"Error – Credential errors"},
                4: {name:"Error – Invalid Method"},
                5: {name:"Error – File system is Full"},
                6: {name:"Warning – File system is almost Full"},
                7: {name:"Error – Read/Write error"},
                8: {name:"File System mount error"},
                9: {name:"File System unmount error"},
                10: {name:"Not Scheduled"},
                11: {name:"Scheduled"}};

            $scope.recording_methods = [{id:0, name:"Disable"},{id:1, name:"Continuous"},{id:2, name:"Scheduled"}];

            $scope.streaming_methods = [{id:0, name:"Disable"},{id:1, name:"Enable"}];

            $scope.streaming_statuses = {0: {name:"Running"}, 1: { name:"Not Running"},2: {name:"Error"}};

            $scope.recording_operational_status = $scope.recording_operational_statuses[1];

            $scope.operationalGeneralSettings = model;

            $scope.feature_streaming = $scope.operationalGeneralSettings.data.FEATURE_0;


            $scope.CallOnBeforeSaved = function()
            {
            };


            $scope.changeStartStop = function()
            {
                $scope.operationalGeneralSettings.data.STREAMER_ACTION == 0 ? ($scope.operationalGeneralSettings.data.STREAMER_ACTION = 1) : $scope.operationalGeneralSettings.data.STREAMER_ACTION = 0;
            };

            $scope.CallOnSaved = function(insideVal,update_success)
            {
                if($scope.feature_streaming != $scope.operationalGeneralSettings.data.FEATURE_0)
                    $scope.$root.streamingChanged = true;
                $scope.$root.isStreamingEnabled = $scope.operationalGeneralSettings.data.FEATURE_0 == 1;
                $scope.$root.isContinuesRecording = $scope.operationalGeneralSettings.data.FEATURE_1 == 1;
                $scope.$root.isScheduledRecording = $scope.operationalGeneralSettings.data.FEATURE_1 == 2;
                if(update_success) {
                    deviceModel.updateDevice({
                        command: Commands.STREAMER_ACTION,
                        value: '2'
                    }).then(function (data) {
                        }
                    );
                }

            };


            var showUpdateErrorMessage = function(data){
                $scope.errorUpdateMessage = buildErrorMessage(data);
                $scope.showErrorOnUpdate = true;
                $timeout(function () {
                    $scope.showErrorOnUpdate = false;
                }, 2000);
            };

            var buildErrorMessage = function(data){
                if(data && data.cmd && data.cmd.key)
                    return "Failed to update " + data.cmd.name;
                else
                    return "Failed to update " ;
            };

            var t = function(status){
                return (status.id == $scope.operationalGeneralSettings.data.RECORDING_STATUS).name;
            }

            $scope.getRecordingStatus = function()
            {
                var a = $scope.recording_operational_statuses.filter(t);
                return a;
            }

        }]);

    KApp.controller('operationalStreamingCtrl', [
        '$scope',
        'deviceModel',
        'Commands',
        'operationalStreaming',
        // 'authentication',
        '$timeout',

        function ($scope, applicationStarter, Commands, model, $timeout) {
            var streaming_protocols = [{id:1, name:"RTSP"}];
            var streaming_methods = [{id:1, name:"Unicast"},{id:2, name:"Multicast"}];
            $scope.streaming_methods = [{id:0, name:"Disable"},{id:1, name:"Enable"}];
            // $scope.refreshForm = {};
            // if($scope.$root.streamingChanged) {
            //     $scope.refreshForm.refresh();
            //     deviceModel.resetData();
            // }
            $scope.operationalStreamingSettings = model;

            if($scope.$root.isStreamingEnabled == undefined)
                $scope.$root.isStreamingEnabled = $scope.operationalStreamingSettings.data.FEATURE_0 == 1;
            $scope.operationalStreamingSettings.streaming_methods = streaming_methods;
            $scope.operationalStreamingSettings.streamingProtocols = streaming_protocols;



            // $scope.operationalStreamingSettings.data.STREAMING_PROTOCOL = parseInt($scope.operationalStreamingSettings.data.STREAMING_PROTOCOL);
            // $scope.operationalStreamingSettings.data.STREAMING_METHOD = parseInt($scope.operationalStreamingSettings.data.STREAMING_METHOD);
            $scope.operationalStreamingSettings.data.CONNECTION_PARAMS = angular.copy($scope.operationalStreamingSettings.data.CONNECTION_PARAMS);

            var selected_streaming_method = $scope.operationalStreamingSettings.data.STREAMING_METHOD;

            if($scope.operationalStreamingSettings.data.MULTICAST_PARAMS && $scope.operationalStreamingSettings.data.MULTICAST_PARAMS.address)
            {
                $scope.operationalStreamingSettings.data.MULTICAST_PARAMS = angular.copy($scope.operationalStreamingSettings.data.MULTICAST_PARAMS);
            }

            $scope.CallOnBeforeSaved = function(){
                if($scope.isEncoder) {
                    $scope.operationalStreamingSettings.data.MULTICAST_PARAMS.toString = function () {
                        return this.address + "," + this.time_to_live;
                    };

                    $scope.operationalStreamingSettings.data.CONNECTION_PARAMS.toString = function () {
                        return this.port + "," + this.folderName;
                    };
                }
                else {
                    $scope.operationalStreamingSettings.data.CONNECTION_PARAMS.toString = function () {
                        return this.IP + "," + this.port + "," + this.folderName;
                    };
                }

            };


            $scope.CallOnSaved = function(insideVal, update_success)
            {
                if(update_success) {
                    deviceModel.updateDevice({
                        command: Commands.STREAMER_ACTION,
                        value: '2'
                    }).then(function (data) {
                        }
                    );
                }

            };


            var showUpdateErrorMessage = function(data){
                $scope.errorUpdateMessage = buildErrorMessage(data);
                $scope.showErrorOnUpdate = true;
                $timeout(function () {
                    $scope.showErrorOnUpdate = false;
                }, 2000);
            };

            var buildErrorMessage = function(data){
                if(data && data.cmd && data.cmd.key)
                    return "Failed to update " + data.cmd.name;
                else
                    return "Failed to update " ;
            };


        }]);


    KApp.controller('operationalRecordingCtrl', [
        '$scope',
        'deviceModel',
        'Commands',
        'streamingOperationalRecording',
        // 'authentication',
        '$timeout',
        '$filter',
        function ($scope, applicationStarter, Commands, model, $timeout, $filter) {
            $scope.excludeFromCompare = ['RECORDING_STATUS'];

            $scope.recording_operational_statuses =
                {0: {name:"Running"},
                    1: {name:"Stopped"},
                    2: {name:"Error - Read only File System"},
                    3: {name:"Error – Credential errors"},
                    4: {name:"Error – Invalid Method"},
                    5: {name:"Error – File system is Full"},
                    6: {name:"Warning – File system is almost Full"},
                    7: {name:"Error – Read/Write error"},
                    8: {name:"File System mount error"},
                    9: {name:"File System unmount error"},
                    10: {name:"Not Scheduled"},
                    11: {name:"Scheduled"}};

            $scope.recording_methods = [{id:0, name:"Disable"},{id:1, name:"Continuous"},{id:2, name:"Scheduled"}];



            $scope.getDateString = function(date){
                date = new Date(date);
                //TIME
                var dday = date.getDate();
                var dmon = date.getMonth() +1;
                var dyear = date.getFullYear();
                var ddate = dday + "-" + dmon + "-" + dyear;
                return ddate;
            };

            $scope.errorUpdateSchedule = "";
            $scope.showErrorUpdateSchedule = "";
            $scope.showRecordingSchedule = false;
            $scope.showSetScheduleError = false;
            $scope.scheduleMessage = "This device does not have a scheduled recording.";
            $scope.scheduleMessageDate = "";
            $scope.setScheduleError = "";
            $scope.operationalRecordingSettings = model;
            $scope.validScheduleTime = false;
            $scope.featureRecordingChanged = false;
            var timeIntervalChecker;

            var recordingDate = $scope.operationalRecordingSettings.data.RECORD_SCHEDULE.date;
            var recordingTime = $scope.operationalRecordingSettings.data.RECORD_SCHEDULE.time;
            var recordingDuration = $scope.operationalRecordingSettings.data.RECORD_DURATION;


            //$scope.operationalRecordingSettings.data.FEATURE_1 = 1;
            $scope.getScheduleMessageClass = function(){
                if($scope.validScheduleTime)
                    return "recordingScheduleMessageEdit";
                else
                    return "recordingScheduleMessageDefault";
            };

            $scope.getScheduleMessageButton = function(){
                if($scope.validScheduleTime)
                    return "Edit";
                else
                    return "Schedule";
            };

            $scope.setScheduleMessage = function(val){
                if(val != undefined){
                    $scope.featureRecordingChanged = false;
                    if(val != $scope.operationalRecordingSettings.data.FEATURE_1)
                        $scope.featureRecordingChanged = true;
                }
                if($scope.validScheduleTime){
                    $scope.scheduleMessage = "This device already has a scheduled recording."
                    $scope.scheduleMessageDate = $scope.getDateString($scope.operationalRecordingSettings.data.RECORD_SCHEDULE.date)  + "; " +
                        "Starts at: " + $scope.operationalRecordingSettings.data.RECORD_SCHEDULE.time + "; " +
                        "Duration: " + $scope.operationalRecordingSettings.data.RECORD_DURATION;
                }
                else{
                    $scope.scheduleMessage = "This device does not have a scheduled recording.";
                    $scope.scheduleMessageDate = "";
                }
            };

            $scope.setScheduleMessage();

            var maxNumOfFiles = $scope.operationalRecordingSettings.data.STORAGE_MAX_FILE;

            $scope.unlimitedNumberOfFiles = false;

            if($scope.operationalRecordingSettings.data.STORAGE_MAX_FILE == 0)
            {
                $scope.unlimitedNumberOfFiles = true;
            }

            if($scope.$root.isContinuesRecording == undefined)
                $scope.$root.isContinuesRecording = $scope.operationalRecordingSettings.data.FEATURE_1 == 1;

            if($scope.$root.isScheduledRecording == undefined)
                $scope.$root.isScheduledRecording = $scope.operationalRecordingSettings.data.FEATURE_1 == 2;

            $scope.operationalRecordingSettings.data.STORAGE_PARAMS = angular.copy($scope.operationalRecordingSettings.data.STORAGE_PARAMS);


            $scope.CallOnBeforeSaved = function(){
                // if($scope.operationalRecordingSettings.data.STORAGE_PARAMS.password != "")
                //     $scope.operationalRecordingSettings.data.STORAGE_PARAMS.password = '"' + "Basic " +  window.btoa($scope.operationalRecordingSettings.data.STORAGE_PARAMS.password) + '"';
                //$scope.operationalRecordingSettings.data.RECORD_SCHEDULE.date = $scope.getDateString($scope.operationalRecordingSettings.data.RECORD_SCHEDULE.date);
            };

            $scope.changeUnlimitedNumOfFiles = function(){
                $scope.unlimitedNumberOfFiles = !$scope.unlimitedNumberOfFiles;
                if($scope.unlimitedNumberOfFiles)
                {
                    $scope.operationalRecordingSettings.data.STORAGE_MAX_FILE = "0";
                }
                else{
                    if(maxNumOfFiles == "0")
                    {
                        $scope.operationalRecordingSettings.data.STORAGE_MAX_FILE = "1";
                    }
                    else{
                        $scope.operationalRecordingSettings.data.STORAGE_MAX_FILE = maxNumOfFiles;
                    }
                }
            };

            $scope.setUnlimitedNumOfFiles = function() {
                maxNumOfFiles = $scope.operationalRecordingSettings.data.STORAGE_MAX_FILE;
            }

            $scope.refreshForm = {};

            var setRecordingDateAndTime = function(){
                $scope.operationalRecordingSettings.data.RECORD_SCHEDULE.date = recordingDate;
                $scope.operationalRecordingSettings.data.RECORD_SCHEDULE.time = recordingTime;
                $scope.operationalRecordingSettings.data.RECORD_DURATION = recordingDuration;
            };

            $scope.getTitle = function()
            {
                return "URI must follow the following syntax scheme: [storageType]://[uriPath]" + "\n" +
                "Available storage types available are: SMB/USB" + "\n" +
                "The URI is limited to be of maximum 1024 characters length." + "\n" +
                "Example: smb://192.168.1.39/KDStoShare";
            }

            $scope.CallOnSaved = function(insideVal, update_success)
            {
                maxNumOfFiles = $scope.operationalRecordingSettings.data.STORAGE_MAX_FILE;
                if(update_success) {
                    deviceModel.updateDevice({
                        command: Commands.STREAMER_ACTION,
                        value: '2'
                    }).then(function (data) {
                        }
                    );
                }

            };

            var showUpdateErrorMessage = function(data){
                $scope.errorUpdateMessage = buildErrorMessage(data);
                $scope.showErrorOnUpdate = true;
                $timeout(function () {
                    $scope.showErrorOnUpdate = false;
                }, 2000);
            };

            var buildErrorMessage = function(data){
                if(data && data.cmd && data.cmd.key)
                    return "Failed to update " + data.cmd.name;
                else
                    return "Failed to update " ;
            };

            $scope.closeRecordingSchedule = function(){
                setRecordingDateAndTime();
                if ($scope.operationalRecordingSettings.data.RECORD_SCHEDULE.date != null) {
                    checkDateTime();
                }
                else{
                    $scope.validScheduleTime = false;
                    $scope.setScheduleMessage();
                }
                $scope.showRecordingSchedule = false;
            };

            $scope.openRecordingSchedule = function(){
                $scope.showErrorUpdateSchedule = false;
                $scope.showSetScheduleError = false;
                $scope.showRecordingSchedule = true;
            };

            var checkDateTime = function(){
                deviceModel.send([Commands.TIME]).then(function (data) {
                    var status = data[0].value.split(',');
                    var a_date = status[1].split("-");
                    var splitted_time = status[2].split(':');
                    var device_date = new Date(a_date[2], parseInt(a_date[1]) - 1, a_date[0],splitted_time[0],splitted_time[1],splitted_time[2]);
                    var date = $scope.getDateString($scope.operationalRecordingSettings.data.RECORD_SCHEDULE.date);
                    var time = $scope.operationalRecordingSettings.data.RECORD_SCHEDULE.time;
                    var splitted_local_date = date.split('-');
                    var splitted_local_time = time.split(':');
                    var splitted_duration = $scope.operationalRecordingSettings.data.RECORD_DURATION.split(':')
                    var local_hour = parseInt(splitted_local_time[0]) + parseInt(splitted_duration[0]);
                    var local_minute = parseInt(splitted_local_time[1]) + parseInt(splitted_duration[1]);
                    var local_sec = parseInt(splitted_local_time[2]) + parseInt(splitted_duration[2]);
                    var local_date = new Date(splitted_local_date[2], parseInt(splitted_local_date[1]) - 1, splitted_local_date[0],splitted_local_time[0],splitted_local_time[1],splitted_local_time[2]);
                    var local_date_with_duration = new Date(splitted_local_date[2], parseInt(splitted_local_date[1]) - 1, splitted_local_date[0],local_hour,local_minute,local_sec);
                    $scope.validScheduleTime = true;
                    if(local_date_with_duration < device_date)
                    {
                        $scope.validScheduleTime = false;
                        recordingDate = null;
                    }
                    $scope.setScheduleMessage();
                });
            }

            var start_time_checker = function(){
                if ($scope.operationalRecordingSettings.data.RECORD_SCHEDULE.date != null) {
                    checkDateTime();
                }
                timeIntervalChecker = setInterval(function () {
                    if ($scope.operationalRecordingSettings.data.RECORD_SCHEDULE.date != null) {
                        checkDateTime();
                    }
                    else{
                        $scope.validScheduleTime = false;
                        recordingDate = null;
                        $scope.setScheduleMessage();
                    }

                }, 10000);};

            start_time_checker();

            $scope.RemoveTimeChecker = function(){
                clearInterval(timeIntervalChecker);
            }


            $scope.saveRecordingSettings = function(){
                if($scope.operationalRecordingSettings.data.RECORD_SCHEDULE.date == undefined){
                    $scope.closeRecordingSchedule();
                    return;
                }
                var date = $scope.getDateString($scope.operationalRecordingSettings.data.RECORD_SCHEDULE.date);
                var time = $scope.operationalRecordingSettings.data.RECORD_SCHEDULE.time;

                deviceModel.send([Commands.TIME]).then(function (data) {
                    var status = data[0].value.split(',');
                    var a_date = status[1].split("-");
                    var splitted_time = status[2].split(':');
                    var device_date = new Date(a_date[2], parseInt(a_date[1]) - 1, a_date[0],splitted_time[0],splitted_time[1],splitted_time[2]);

                    var splitted_local_date = date.split('-');
                    var splitted_local_time = time.split(':');
                    var splitted_duration = $scope.operationalRecordingSettings.data.RECORD_DURATION.split(':')
                    var local_hour = parseInt(splitted_local_time[0]) + parseInt(splitted_duration[0]);
                    var local_minute = parseInt(splitted_local_time[1]) + parseInt(splitted_duration[1]);
                    var local_sec = parseInt(splitted_local_time[2]) + parseInt(splitted_duration[2]);
                    var local_date = new Date(splitted_local_date[2], parseInt(splitted_local_date[1]) - 1, splitted_local_date[0],splitted_local_time[0],splitted_local_time[1],splitted_local_time[2]);
                    var local_date_with_duration = new Date(splitted_local_date[2], parseInt(splitted_local_date[1]) - 1, splitted_local_date[0],local_hour,local_minute,local_sec);

                    if(local_date_with_duration < device_date)
                    {
                        $scope.showSetScheduleError = true;
                        $scope.setScheduleError = 'Schedule recording date or time are invalid';
                        return;
                    }
                    var commands_to_send ={};

                    if(recordingDate == null && $scope.operationalRecordingSettings.data.RECORDING_STATUS != 10) {
                        commands_to_send = {
                            "FEATURE_1": Commands.FEATURE['1'],
                            "STREAMER_ACTION": Commands.STREAMER_ACTION
                        };
                        commands_to_send.FEATURE_1.value = $scope.operationalRecordingSettings.data.FEATURE_1;
                        commands_to_send.STREAMER_ACTION.value = '2';
                    }


                    if(local_date >= device_date)
                    {
                        commands_to_send["RECORD_SCHEDULE"] = Commands.RECORD_SCHEDULE;
                        commands_to_send.RECORD_SCHEDULE.value = date + "," + time;
                    }

                    commands_to_send["RECORD_DURATION"] = Commands.RECORD_DURATION;
                    commands_to_send.RECORD_DURATION.value = $scope.operationalRecordingSettings.data.RECORD_DURATION;

                    deviceModel.updatePipe(commands_to_send).then(function(data){
                            var success = true;
                            var errorMessages = "";
                            for(var resp in data){
                                if(!angular.isUndefined(data[resp].errCode)){
                                    errorMessages += buildErrorMessage(data[resp]) + "\n";


                                    success = false;
                                }
                                else
                                {
                                    if(data[resp].cmd.key == "RECORD_DURATION")
                                    {
                                        recordingDuration = $scope.operationalRecordingSettings.data.RECORD_DURATION;
                                    }
                                    else{
                                        recordingDate = $scope.operationalRecordingSettings.data.RECORD_SCHEDULE.date;
                                        recordingTime = $scope.operationalRecordingSettings.data.RECORD_SCHEDULE.time;
                                    }
                                }
                            }
                            if(success)
                            {
                                checkDateTime();
                                $scope.closeRecordingSchedule();
                                //$scope.setScheduleMessage();
                                //model.init(true);
                                $scope.refreshForm.refreshModel();
                            }
                            else{
                                $scope.errorUpdateSchedule = errorMessages;
                                $scope.showErrorUpdateSchedule = true;

                            }

                        }
                    );
                });
            };

            $scope.$on("$destroy", function() {
                setRecordingDateAndTime();
            });

            $scope.removeErrorMessage = function(){
                $scope.showErrorUpdateSchedule = false;
                $scope.showSetScheduleError = false;
            }

        }]);

    KApp.controller('operationalTunnelingCtrl', [
        '$scope',
        'deviceModel',
        'Commands',
        'operationalTunnelingSettings',
        // 'authentication',
        '$timeout',
        '$sce',
        function ($scope, applicationStarter, Commands, model, $timeout, $sce) {
            var urlPrefix = isDebug ? debugURL + "Partials/html/" : "/";
            $scope.url = $sce.trustAsResourceUrl(urlPrefix + 'tunnelingActiveClients.html');
            $scope.ioPortSelectedIndex = 0;
            $scope.baudRateList = [115200, 57600, 56000, 38400, 19200, 14400, 9600, 4800];
            $scope.stopBitsList = [1, 2];
            $scope.dataBitsList = [7, 8];
            $scope.parityList = [
                {"name": "None", "value": 0},
                {"name": "Odd", "value": 1},
                {"name": "Even", "value": 2}//,
                //{"name": "Mark", "value": 3},
                //{"name": "Space", "value": 4}
            ];
            $scope.excludeFromCompare = ['ETH_TUNNEL_*'];


            $scope.operationalTunnelingSettings = model;
            //$scope.com_route_before = angular.copy($scope.operationalTunnelingSettings.data.COM_ROUTE_1);

            $scope.operationalTunnelingSettings.data.UART_1 = angular.copy($scope.operationalTunnelingSettings.data.UART_1);
            $scope.operationalTunnelingSettings.data.COM_ROUTE_1 = angular.copy($scope.operationalTunnelingSettings.data.COM_ROUTE_1);


            $scope.ioPortSelect = function (index) {
                $scope.ioPortSelectedIndex = index;

            }

            var showUpdateErrorMessage = function(data){
                $scope.errorUpdateMessage = buildErrorMessage(data);
                $scope.showErrorOnUpdate = true;
                $timeout(function () {
                    $scope.showErrorOnUpdate = false;
                }, 2000);
            };

            var buildErrorMessage = function(data){
                if(data && data.cmd && data.cmd.key)
                    return "Failed to update " + data.cmd.name;
                else
                    return "Failed to update " ;
            };

            $scope.CallOnBeforeSaved = function(){
                // if($scope.$root.isEncoder) {
                //     if(!angular.equals($scope.com_route_before, $scope.operationalTunnelingSettings.data.COM_ROUTE_1)){
                //         deviceModel.updateDevice({
                //             command: Commands.COM_ROUTE_REMOVE,
                //             value: '1'
                //         }).then(function(data){
                //             deviceModel.updateDevice({
                //                 command: Commands.COM_ROUTE_ADD,
                //                 value: $scope.buildComRouteAdd()
                //             }).then(function(data){
                //                 deviceModel.operationalTunnelingSettings.init(true);
                //                 }
                //             );
                //             }
                //         );
                //     }
                //
                // }

            };


            $scope.activeClientsRefresh = function(){

                //deviceModel.resetData()
                deviceModel.send([Commands.ETH_TUNNEL]).then(function (data) {
                    $scope.operationalTunnelingSettings.data.ETH_TUNNEL = {};
                    var splitted_tunnel_params = data[0].value.split(',');
                    var tunnel_data = {};
                    tunnel_data.commNum = splitted_tunnel_params[1];
                    tunnel_data.portType = splitted_tunnel_params[2];
                    tunnel_data.ETH_Port = parseInt(splitted_tunnel_params[3]);
                    tunnel_data.ETH_IP = splitted_tunnel_params[4];
                    tunnel_data.ETH_RepEn = splitted_tunnel_params[6];
                    tunnel_data.Wired = splitted_tunnel_params[7];
                    $scope.operationalTunnelingSettings.data.ETH_TUNNEL[splitted_tunnel_params[0]] = tunnel_data;

                });
            }


            $scope.buildComRouteAdd = function(){
                return $scope.operationalTunnelingSettings.data.COM_ROUTE_1.com_num + "," +
                    $scope.operationalTunnelingSettings.data.COM_ROUTE_1.port_type + "," +
                    $scope.operationalTunnelingSettings.data.COM_ROUTE_1.port_number + "," +
                    $scope.operationalTunnelingSettings.data.COM_ROUTE_1.replies + "," +
                    $scope.operationalTunnelingSettings.data.COM_ROUTE_1.keep_alive_timing;
            }


            $scope.CallOnSaved = function(insideVal)
            {
                // deviceModel.updateDevice({
                //     command: Commands.STREAMER_ACTION,
                //     value: '2'
                // }).then(function(data){}
                // );

            };


        }]);

}());









