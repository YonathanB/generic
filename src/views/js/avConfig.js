/***********************************************
 * File Name:
 * Created by: Bo Salomon
 * On: 21/1/2018 11:30
 * Modified by: bsalomon
 ***********************************************/

(function () {

    angular.module('web.controllers').controller('avConfigCtrl', [
        '$scope',
        'deviceModel',
        '$timeout',
        '$rootScope',
        '$stateParams',
        '$state',
        'Commands',
        'DevicePorts',
        function ($scope, applicationService, $timeout, $rootScope, $stateParams, $state, Commands, DevicePorts) {
            if (utils.browserName == "IE") {
                $("#av-config").addClass("ie");
            }

            var firstTime = true;
            $scope.data = DevicePorts.output;
            $scope.viewModel = {
                brightness: 0,
                contrast: 0,
                saturation: 0,
                pattern: 1
            };
            $scope.sliderModels = ['brightness', 'contrast', 'saturation'];
            $scope.sliderTitles = ['Brightness', 'Contrast', 'Saturation'];
            $scope.sliderFields = [Commands.BRIGHTNESS, Commands.CONTRAST, Commands.W_SATURATION];
            $scope.activeOutput = 1;

            $scope.iconState = [0, 0, 0];
            $scope.iconStates = [
                {iconClass: "icon_muteOFF", title: "Click to mute", style: null},
                {iconClass: "icon_muteON", title: "Click to unmute", style: null}
            ];
            $scope.iconDisableState = {iconClass: "icon_muteDisabled", title: "Control is disabled"};

            $scope.resolutions = {
                '0': "Native",
                '1': "640x480p@60Hz",
                '2': "720x480p@60Hz",
                '17': "720x576p@50Hz",
                '65': "800x600p@60Hz",
                '66': "1024x768@60Hz",
                '4': "1280x720p@60Hz",
                '19': "1280x720p@50Hz",
                '67': "1280x768p@60Hz",
                '68': "1280x1024p@60Hz",
                '69': "1600x1200p@60Hz",
                '70': "1680x1050p@60Hz",
                '32': "1920x1080p@24Hz",
                '33': "1920x1080p@25Hz",
                '34': "1920x1080p@30Hz",
                '31': "1920x1080p@50Hz",
                '16': "1920x1080p@60Hz",
                '71': "1920x1200@60Hz",
                '72': "3840x2160p@24Hz",
                '73': "3840x2160p@25Hz",
                '74': "3840x2160p@30Hz",
                '75': "3840x2160p@50Hz",
                '76': "3840x2160p@60Hz"
            };

            $scope.patterns = {};

            for (var i = 1; i < 17; i++) {
                var idx = i.toString();
                $scope.patterns[idx] = "pattern " + idx
            }

            $scope.update = function(cmd, newValue){
                var port = $scope.data[$scope.activeOutput];
                var noop = function() {};
                deviceModel.portsList.updateDevice(port, cmd, newValue).then(
                    $scope.loadViewModel, $scope.loadViewModel
                )
            };

            $scope.setActiveOutput = function(tab) {
                $scope.activeOutput = tab;
                $timeout($scope.loadViewModel);
            };

            $scope.loadViewModel = function() {
                var pattern = parseInt($scope.data[$scope.activeOutput][Commands.VIDEO_PATTERN.key]);
                if ($scope.viewModel.pattern != pattern && pattern > 0) {
                    $("#patterns").ddslick('select', {index: $scope.valToIndex[pattern.toString()]});
                    $scope.viewModel.pattern = pattern.toString();
                }

                if (pattern != "0") {
                    $scope.viewModel.videoSource = 1;
                } else {
                    $scope.viewModel.videoSource = 0;
                }
                $scope.viewModel.audioFormat = $scope.data[$scope.activeOutput][Commands.AUD_SIG_TYPE.key].trim();
                $scope.viewModel.audioSource = angular.copy($scope.data[$scope.activeOutput][Commands.AUD_SDI_SELECT.key]);
                $scope.viewModel.resolution = angular.copy($scope.data[$scope.activeOutput][Commands.VID_RES.key]);
                $scope.viewModel.iconState  = parseInt($scope.data[$scope.activeOutput][Commands.MUTE.key]);
                $scope.viewModel.contrast  = parseInt($scope.data[$scope.activeOutput][Commands.CONTRAST.key]);
                $scope.viewModel.brightness  = parseInt($scope.data[$scope.activeOutput][Commands.BRIGHTNESS.key]);
                $scope.viewModel.saturation  = parseInt($scope.data[$scope.activeOutput][Commands.W_SATURATION.key]);
            };

            function computePattern() {
                return (parseInt($scope.viewModel.pattern) * parseInt($scope.viewModel.videoSource)).toString();
            }

            $scope.setWatches = function() {
                //  Watch for ui changes to  fields using controls that don't have on-change handlers
                $scope.$watch("viewModel.videoSource", function (nv, ov) {
                    if (nv != ov) {
                        if (nv == "1") {
                            // when the videoSource changes to signal generator, set the signal to a default value
                            if ($scope.viewModel.pattern == 0) {
                                $scope.viewModel.pattern = 1;
                                $("#patterns").ddslick('select', {index: $scope.valToIndex[$scope.viewModel.pattern]});
                                return;
                            }
                        }

                        $scope.setVideoSource();
                    }
                })

                $scope.$watch('viewModel.audioFormat', function (nv, ov) {
                    if (angular.isDefined($scope.viewModel.audioFormat) &&
                        $scope.viewModel.audioFormat != $scope.data[$scope.activeOutput][Commands.AUD_SIG_TYPE.key].trim()) {

                        $scope.update(Commands.AUD_SIG_TYPE.key, $scope.viewModel.audioFormat.toString())
                    }
                })

                $scope.$watch('data', $scope.loadViewModel, true);
            };

            // 'on-change' Handlers
            $scope.setAudioSource = function() {
                $scope.update(Commands.AUD_SDI_SELECT.key, $scope.viewModel.audioSource);
            }
            $scope.setVideoSource = function() {
                var pat = computePattern();
                if (pat != $scope.data[$scope.activeOutput][Commands.VIDEO_PATTERN.key].trim()) {
                    $scope.update(Commands.VIDEO_PATTERN.key, computePattern());
                }
            }
            $scope.setResolution = function(){
                $scope.update(Commands.VID_RES.key, $scope.viewModel.resolution);
            }
            $scope.slideOn = function(index, activeOutput, value) {
                if ($scope.data[$scope.activeOutput][$scope.sliderFields[index].key] != value.toString())
                    $scope.update($scope.sliderFields[index].key,  value)
            }
            $scope.iconOnAction = function() {
                $scope.viewModel.iconState = ($scope.viewModel.iconState + 1) % 2;
                $scope.update(Commands.MUTE.key,  $scope.viewModel.iconState)
            }


            $scope.ddValues = [
                {value: "1", imageSrc: "black.jpg", text: "Black"},
                {value: "2", imageSrc: "white.jpg", text: "White"},
                {value: "3", imageSrc: "checkerboard.jpg", text: "Checkerboard"},
                {value: "4", imageSrc: "crosshatch.jpg", text: "Crosshatch"},
                {value: "5", imageSrc: "h_ramp.jpg", text: "Horizontal Ramp"},
                {value: "6", imageSrc: "v_ramp.jpg", text: "Vertical Ramp"},
                {value: "7", imageSrc: "hv_ramp.jpg", text: "Diagonal Ramp"},
                {value: "8", imageSrc: "bw_vertical_line.jpg", text: "Vertical Lines"},
                {value: "9", imageSrc: "blue.jpg", text: "Blue"},
                {value: "10", imageSrc: "green.jpg", text: "Green"},
                {value: "11", imageSrc: "red.jpg", text: "Red"},
                {value: "12", imageSrc: "colorsweep.jpg", text: "Color Sweep"},
                {value: "13", imageSrc: "test_pattern.jpg", text: "Test Pattern"},
                {value: "14", imageSrc: "tv-snow.jpg", text: "TV Snow"},
                {value: "15", imageSrc: "tartancolorbars.jpg", text: "Tartan"},
                {value: "16", imageSrc: "color_ramp.jpg", text: "Color Ramp"},
                {value: "17", imageSrc: "dp_color_square.jpg", text: "Colored Squares "}
            ];
            $scope.valToIndex = {};
            for (var i = 0; i < $scope.ddValues.length; i++)
                $scope.valToIndex[$scope.ddValues[i].value] = i;

            $scope.initializeDropdown = function() {
                $("#patterns").ddslick({
                    width: 185,
                    height: 294,
                    data: $scope.ddValues,
                    onSelected: function (data) {
                        if (firstTime) {
                            firstTime = false;
                        } else {
                            $scope.$apply(function () {
                                // Don't send update upon first load
                                var sendUpdate = angular.isDefined($scope.viewModel.pattern)
                                $scope.viewModel.pattern = data.selectedData.value;
                                $scope.viewModel.videoSource = 1;
                                if (sendUpdate)
                                    $scope.setVideoSource();
                            })
                        }
                    }
                });
            };

            // OK, load up and set off
            $scope.initializeDropdown();
            $timeout(function() {
                $scope.loadViewModel()
                $scope.setWatches();
            });

        }])
})();

