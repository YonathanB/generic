/***********************************************
 * File Name:
 * Created by: Yonathan Benitah
 * On: 20/11/2016  17:44
 * Last Modified: 20/11/2016
 * Modified by: ybenitah
 ***********************************************/

//TODO restructure codes + re-set the MessageService usage

(function () {
    angular.module('components.matrix')
        .directive('kMatrix', ['$sce', '$timeout', '$filter',
            function ($sce, $timeout, $filter) {
                return {
                    restrict: 'E',
                    template: require('./k-matrix.html'),
                    // require: ['^kPort', '?kPortInfo'],
                    scope: {
                        // MatrixVM: '=ngModel',
                        portsList: '=',
                        matrixFilters: '=?matrixFilters',
                        openSettingWindow: '&onPortClick',
                        onPortDataChanged: '&'
                    },
                    transclude: true,
                    controller: function ($scope, Commands/*, MessageService*/) {
                        var toSave = {};

                        // if (typeof $scope.matrixFilters == 'undefined')
                        //     $scope.MatrixVM.filter = {value: [], label: ''};
                        //
                        // else
                        //     $scope.MatrixVM.filter =
                        //         $scope.matrixFilters[$scope.matrixFilters.selected.key][$scope.matrixFilters.selected.index];


                        $scope.settingWindow = false;

                        $scope.openInfo = function (port) {
                            $scope.openSettingWindow(port);
                        };
                        $scope.routeSignal = function (newInput, newOutput, signal) { // we're sending only 1 signal
                            $scope.saveProcessSignal = signal;
                            if (signal.length > 1) // If multiple signal we need to check if signals are filtered
                                if ($scope.MatrixVM.filter.value.length > 1 && $scope.MatrixVM.filter.value.indexOf(newOutput.masterSignal) > -1) // if signal filtered & masterSignal into filtered
                                    signal = newOutput.masterSignal; // signal is mastered signal
                                else if ($scope.MatrixVM.filter.value.length === 1)
                                    signal = $scope.MatrixVM.filter.value[0];
                                else
                                    signal = signal[0];
                            else signal = signal[0];
                            $scope.saveProcess[newInput.id + '-' + newOutput.id] = true;
                            $scope.MatrixVM.updateDevice([{
                                'route':{
                                    input: newInput,
                                    output: newOutput,
                                    signal: signal
                                }
                            }]).then(function (data) {
                                $scope.saveProcess[newInput.id + '-' + newOutput.id] = false;
                                $scope.saveProcessSignal = [];
                            }, function (data) {
                                $scope.saveProcess[newInput.id + '-' + newOutput.id] = false;
                                $scope.saveProcessSignal = [];
                            })
                        };
                        // $scope.selectableAutoSwitch = $filter('matrixFilter')($scope.MatrixVM.inputs, ['VIDEO'], 'signal');

                        $scope.getTitle = function (port, data) {
                            if (angular.isUndefined(port.title)) port.title = '';
                            for (var prop in data) {
                                port.title += '\n' + prop + ': ';
                                port.title += data[prop].join(',');
                            }
                        };

                        $scope.openSettingWindow = function (port) {

                            // deviceModel.portsList.getPortData(port.id) TODO - set promise back
                            //     .then(function(data){
                            $scope.settingWindow = true;
                            $scope.port = port;


                            $scope.settingWindowIsDirty = false;
                            $scope.closeSettingWindow = function (data, save) {
                                toSave = angular.copy(data);

                                $scope.settingWindowIsDirty = false;
                                for (var field in data) {
                                    var portValue = typeof $scope.port[field] != 'string' ? JSON.stringify($scope.port[field]) : $scope.port[field];

                                    if ((angular.isDefined(portValue) && portValue != JSON.stringify(data[field].value))
                                        || (angular.isUndefined(portValue) && JSON.stringify($scope.port[Commands[field].name]) != JSON.stringify(data[field].value))) {
                                        $scope.settingWindowIsDirty = true;
                                        break;
                                    }
                                }
                            };

                            $scope.closePortInfo = function (save) {
                                if (angular.isDefined(save)) {
                                    if (save) {
                                        if(toSave.hasOwnProperty(Commands.SWITCH_PRIORITY.key)){
                                            $scope.portsList.updateDevice(toSave[Commands.SWITCH_PRIORITY.key].port, toSave[Commands.SWITCH_PRIORITY.key].cmd, toSave[Commands.SWITCH_PRIORITY.key].value);
                                        delete toSave[Commands.SWITCH_PRIORITY.key];
                                        }
                                        for (var command in  toSave) {
                                            if (toSave.hasOwnProperty(command))
                                                $scope.portsList.updateDevice(toSave[command].port, toSave[command].cmd, toSave[command].value);
                                        }
                                    }
                                    $scope.settingWindow = false;
                                    toSave = {};
                                }
                                else if ($scope.settingWindowIsDirty && toSave && !angular.equals({}, toSave)) {
                                    // MessageService.newMessage({
                                    //     title: 'Unsaved Changes',
                                    //     type: 'alert',
                                    //     isModal: true,
                                    //     closeBtn: false,
                                    //     body: '<p>It looks like you are editing something.<br>' +
                                    //     'Unsaved changes will be lost. </p>' +
                                    //     '<p style="font-size: 14px; font-weight: bold">Leave anyway?</p>',
                                    //     buttons: [{
                                    //         text: MessageService.button.no,
                                    //         onClick: function () {
                                    //             angular.noop();
                                    //         }
                                    //     },
                                    //         {
                                    //             text: MessageService.button.yes,
                                    //             onClick: function () {
                                    //                 $scope.settingWindow = false;
                                    //                 toSave = {};
                                    //             }
                                    //         }]
                                    // });
                                }
                                else
                                    $scope.settingWindow = false;
                            }
                        }
                    },
                    link: function (scope, $element, attrs) {
                        scope.saveProcess = {};
                        var UI_Matrix = $element.find('#routing-matrix');
                            scope.overCell = function () {
                            var hoveredCell = UI_Matrix.find('.k-matrix-row > .over-cell:hover');
                            var rows = hoveredCell.parents('.k-matrix-row').find('.over-cell');
                            var cols = UI_Matrix.find('.over-cell:nth-child(' + (hoveredCell.index() + 1) + ')');

                            for(var idx = 0; idx <= rows.length; idx++){
                                var $el = angular.element(rows[idx]);
                                if(!$el.hasClass('cell-over') && idx <= hoveredCell.index() )
                                    $el.addClass('cell-over');
                                else
                                    break;
                            }
                             for(var idx = 0; idx <= cols.length; idx++){
                                var $el = angular.element(cols[idx]);
                                if(!$el.hasClass('cell-over') )
                                    $el.addClass('cell-over');
                                else
                                    break;
                            }

                        };
                        scope.removeOverCell = function () {
                            var cells = UI_Matrix.find('.cell-over').toArray();
                            cells.forEach(function (element) {
                                element.className = element.className.replace(new RegExp('(?:^|\\s)' + 'cell-over' + '(?:\\s|$)'), '');
                            });
                        };
                        // scope.$watch('MatrixVM.filter', function (val) {
                        //     if (typeof val != 'undefined' && val.value.length > 0) {
                        //         $element.fadeOut(0);
                        //         $timeout(function () {
                        //             $element.fadeIn(500)
                        //         }, 500);
                        //     }
                        // });
                    }
                }
            }]);
})();