(function () {
    'use strict';
    /**
     * @memberof model
     * @ngdoc object
     * @name model.Matrix
     * @param {object} Port: contains definition of I/O port in matrix
     * @param {object} ConnectorsFactory: mapping each port type to its signals
     * @description
     *   The Matrix factory contains all the definition of the device matrix like ports and routing.
     *   It also contains some restriction due to hardware limit, like the no-routing possibilities.
     *   Ports can be get by id, index, direction or master signal.
     *   The viewModel properties is an object that will be send to the UI layer
     */
    angular.module('model')
        .factory('Matrix', ['Port', 'ConnectorsFactory',
            function (Port, ConnectorsFactory) {
                var _matrixDescriptor;
                var _initialized = false;
                var _dataToLoadOnInit;
                var _advancedDataToLoad;
                var _portsList;
                var _routes;
                var _portsType = [];
                var _onUpdate = null;

                var _viewModel = {
                    routes: null,
                    portsType: _portsType,
                    portsList: Object.create({
                        byIndex: {},
                        byDirection: {},
                        byMasterSignal: {},
                        update: function(data){
                            _onUpdate(data)
                        }
                    })
                };


                return {
                    ViewModel: _viewModel,

                    // getportsType: _getPortsType,
                    setMatrixDescriptor: _setMatrixDescriptor,
                    addPort: _addPort,
                    updateRoutes: _updateRoutes
                };

                function _setMatrixDescriptor(matrixDescriptor) {
                    _matrixDescriptor = matrixDescriptor;
                }

                function _getPortsType(matrixDescriptor) {
                    _matrixDescriptor = matrixDescriptor;
                }

                function _updateRoutes(newRoutes) {
                    _viewModel.routes = newRoutes;
                }

                // function _onUpdate(data) {
                //     _viewModel.routes = newRoutes;
                // }


                /**
                 * @ngdoc function
                 * @name model.Matrix#_getPortDirection
                 * @methodOf model.Matrix
                 * @description some ports are set as _both_, but they should be input or output
                 * @param {object=} port we want to know its direction

                 * @returns {string} can be input or output
                 */
                function _getPortDirection(port) {
                    if (_matrixDescriptor.hasOwnProperty('bothPortsDirection')) {
                        var toInputsPort = _matrixDescriptor['bothPortsDirection'].input;
                        var toOutputsPort = _matrixDescriptor['bothPortsDirection'].output;

                        if (toInputsPort && toOutputsPort)
                            if ((toInputsPort.indexOf(port) > -1 || port.indexOf('IN') > -1) && toOutputsPort.indexOf(port) === -1) return 'input';
                            else return 'output';
                    } else {
                        if (port.indexOf('IN') > -1) return 'input';
                        else return 'output';
                    }
                }

                /**
                 * @ngdoc function
                 * @name model.Matrix#_addPort
                 * @methodOf model.Matrix
                 * @description create a port in matrix
                 * @param {string=} portId

                 * @returns {undefined} It doesn't return
                 */
                function _addPort(portId) {
                    let portData = portId.split('.');
                    let portType = portData[1];
                    let portIndex = portData[2];
                    let portDirection = _getPortDirection(portId);

                    let supportedSignals = ConnectorsFactory.ports[portType];
                    let portMasterSignal = ConnectorsFactory.masterSignal[portType] ?
                        ConnectorsFactory.masterSignal[portType] : supportedSignals[0];

                    _viewModel.portsList[portId] = new Port(portId, portType, portIndex, portDirection, supportedSignals, portMasterSignal);


                    if (_portsType.indexOf(portType) === -1) _portsType.push(portType);

                    if (!_viewModel.portsList.byIndex[portIndex]) _viewModel.portsList.byIndex[portIndex] = [];

                    if (!_viewModel.portsList.byDirection[portDirection]) _viewModel.portsList.byDirection[portDirection] = [];

                    if (!_viewModel.portsList.byMasterSignal[portMasterSignal]) _viewModel.portsList.byMasterSignal[portMasterSignal] = [];


                    _viewModel.portsList.byDirection[portDirection].push(_viewModel.portsList[portId]);
                    _viewModel.portsList.byIndex[portIndex].push(_viewModel.portsList[portId]);
                    _viewModel.portsList.byMasterSignal[portMasterSignal] = _viewModel.portsList[portId];
                }


            }])

        .factory('Port', function () {

            return function Port(portId, type, index, direction, supportedSignals, portMasterSignal) {
                this.portIndex = index;
                this.portType = type;
                this.direction = direction;
                this.id = portId;
                if (this.portType.indexOf('USB') > -1)
                    this.name = type.replace('_', ' Type- ') + index;
                else
                    this.name = type.replace('_', ' ') + ' ' + index;
                this.label = null;
                this.supportedSignals = supportedSignals;
                this.selectedPort = true;
                this.signal = false;
                this.masterSignal = portMasterSignal;

                this.followers = null;
                this.followerMode = {};
                if (this.supportedSignals.length > 1 && this.direction === 'input') {
                    this.followers = {};
                    for (let i = 0; i < this.supportedSignals.length; i++) {
                        if (this.supportedSignals[i] !== this.masterSignal) {
                            this.followers[this.supportedSignals[i]] = {
                                list: [], //id, label
                                selected: null
                            }
                        }
                    }
                }
                return this;
            }


        })
        .factory("ConnectorsFactory", [function () {
            var _ports = {
                HDBT: ['VIDEO', 'AUDIO', 'RS232', 'IR', 'USB'],
                HDMI: ['VIDEO', 'AUDIO'],
                IR: ['IR'],
                USB_A: ['USB'],
                USB_B: ['USB'],
                ANALOG_AUDIO: ['AUDIO'],
                MIC: ['AUDIO'],
                AMPLIFIED_AUDIO: ['AUDIO'],
                RS232: ['RS232']
            };

            var _signalsToPort = {
                'VIDEO': ['HDMI', 'HDBT', 'DVI', 'VGA'],
                'AUDIO': ['HDMI', 'HDBT', 'ANALOG_AUDIO', 'MIC', 'AMPLIFIED_AUDIO'],
                'IR': ['HDBT', 'IR'],
                'USB': ['HDBT', 'USB_A', 'USB_B'],
                'RS232': ['HDBT', 'RS232']
            };

            var _masterSignal = {
                HDBT: 'VIDEO',
                HDMI: 'VIDEO'
            };

            var _switchablePorts = [];

            return {
                ports: _ports,
                masterSignal: _masterSignal,
                switchablePorts: _switchablePorts,
                signalsToPort: _signalsToPort
            };
        }])
})();