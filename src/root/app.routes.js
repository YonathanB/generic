
import {applicationStarter} from "../model/applicationStarter";

let isDebug = (process.env.NODE_ENV === 'development');
    angular.module('kramerWeb')
        .config(['$stateProvider',
            function ($stateProvider) {
                $stateProvider
                    .state({
                        name: 'main',
                        abstract: true,
                        url: '',
                        views: {
                            'mainView@': {
                                template: '<ui-view/>',
                                controller: function ($rootScope, $scope, $timeout, $http, $q, Commands, MainService, $transitions) {

                                    MainService.then(function () {
                                        $scope.vm = applicationStarter.getViewModel()
                                    });

                                    $transitions.onStart({}, function(transition) {
                                        console.log('transition', transition)
                                        if (transition.to().name === 'unreachable') {
                                            return false;
                                        }
                                    })
                                    // Features LoadSaveConfig remoteDeviceControlConfigurationServiceFactory TODO set it back
                                    // if (DeviceModel.global) {
                                    //     if (!DeviceModel.global.initialized)
                                    //         DeviceModel.global.init().then(function () {
                                    //             $scope.global = DeviceModel.global.data;
                                    //         });
                                    //     else
                                    //         $scope.global = DeviceModel.global.data;
                                    // }


                                    // var _configCmds = (isDebug ? debugURL : "output_device_control/usr/etc/") + "cntrl_commands.json";
                                    // var _configCmdsDefs = (isDebug ? debugURL : "output_device_control/etc/") + "cntrl_commands_definitions.json";
                                    // var _panelInfo = "output_device_control/usr/etc/panel_info.json";

                                    //
                                    // var MaestroUrls = {};
                                    //
                                    // $rootScope.hasRoomController = Features.featuresList.RoomController;
                                    // $rootScope.hasMaestro = Features.featuresList.Maestro;
                                    // $rootScope.hasMaestroPanel = Features.featuresList.MaestroPanel;
                                    //
                                    // try {
                                    //     if ($rootScope.hasMaestro || $rootScope.hasMaestroPanel) {
                                    //         remoteDeviceControlConfigurationServiceFactory.setConfigurationByModel({
                                    //             model: $rootScope.model,
                                    //             isMaestro: true
                                    //         });
                                    //         remoteDeviceControlConfigurationServiceFactory.setJsonDataRequestUrl(_configCmdsDefs, _configCmds, _panelInfo);
                                    //         remoteDeviceControlConfigurationServiceFactory.setJsonMethodType(2);
                                    //     }
                                    //
                                    //     var maestroDataConfig = null;
                                    //     var maestroPanelConfig = null;
                                    //
                                    //
                                    //     if ($rootScope.hasMaestro) {
                                    //         MaestroUrls.maestroConfigUrl = "/output_device_control/configuration/upload";
                                    //         $http.get(_configCmds + "?hash_id=" + Math.random())
                                    //             .then(function (response) {
                                    //                 maestroDataConfig = response.data;
                                    //             });
                                    //     }
                                    //
                                    //     if ($rootScope.hasMaestroPanel) {
                                    //         MaestroUrls.maestroPanelUrl = "/output_device_control/panel_info/upload";
                                    //         $http.get(_panelInfo + "?hash_id=" + Math.random())
                                    //             .then(function (response) {
                                    //                 maestroPanelConfig = response.data;
                                    //             });
                                    //     }
                                    // } catch (e) {// TODO - we will have to deal with it
                                    //     console.log('Everything is OK is a Maestro issue')
                                    // }


                                    // $rootScope.loadKCD = function (el) {
                                    //
                                    //
                                    //     var deferred = $q.defer();
                                    //     if (el.files.length > 0) {
                                    //         var reader;
                                    //         reader = new FileReader();
                                    //         reader.readAsText(el.files[0]);
                                    //
                                    //         //TODO if we need to send data (VS41H2)
                                    //         reader.onload = function (loadEvent) {
                                    //             $scope.$apply(function () {
                                    //                 deferred.resolve(LoadSaveConfig.SetPresetsRest(el.files[0], loadEvent.target.result))
                                    //
                                    //                 // deferred.resolve(LoadSaveConfig.SetPresetsRest())
                                    //                 // deferred.resolve(LoadSaveConfig.loadConfigCommandFiles(JSON.parse(loadEvent.target.result)), Commands)
                                    //                 el.value = '';
                                    //             });
                                    //         };
                                    //     }
                                    //     else
                                    //         deferred.resolve();
                                    //     return deferred.promise;
                                    // };
                                    //
                                    //
                                    // $rootScope.kcdConfigPath = location.origin + '/presets/current';
                                    // $rootScope.saveKCD = function () {
                                    //     return LoadSaveConfig.GetCurrentConfigRest()
                                    //     // return LoadSaveConfig.SetCurrentConfigRest({
                                    //     //     "maestroDataConfigUrl": MaestroUrls.maestroConfigUrl,
                                    //     //     "maestroPanelConfigUrl": MaestroUrls.maestroPanelUrl,
                                    //     //     "maestroDataConfig": maestroDataConfig,
                                    //     //     "maestroPanelConfig": maestroPanelConfig
                                    //     // })
                                    //     // saveConfigCommandFiles();
                                    // }
                                }
                            }
                        }

                    })

            }])
        .factory("ViewSettingsFactory", ['$state', '$urlRouter',
            function ($state, $urlRouter) {
                var navigation = {};
                var statePref = "main.";
                var lastRequestedState = '';
                var menuObj = {};
                var menus = [];

                var insertInMenu = function (stateDefinition, inMenuTab, parentName) {
                    var toInsert = {};
                    toInsert.state = stateDefinition.id;
                    toInsert.id = stateDefinition.id;
                    toInsert.url = stateDefinition.url;
                    toInsert.description = stateDefinition.description;
                    toInsert.menuTab = inMenuTab;
                    toInsert.redirectTo = stateDefinition.redirectTo;
                    toInsert.onLoad = stateDefinition.onLoad;
                    toInsert.parent = stateDefinition.parent ? stateDefinition.parent : 'main';


                    if (stateDefinition.hasOwnProperty('params'))
                        toInsert.params = stateDefinition.params;
                    if (stateDefinition.hasOwnProperty('abstract'))
                        toInsert.abstract = stateDefinition.abstract;
                    if (stateDefinition.hasOwnProperty('resolve')) {
                        toInsert.resolve = {};
                        // for (var resl in stateDefinition.resolve) {
                        //     toInsert.resolve[stateDefinition.resolve[resl]] = dependencyResolve[stateDefinition.resolve[resl]];
                        // }
                    }
                    if (stateDefinition.hasOwnProperty('icon'))
                        toInsert.icon = stateDefinition.icon;
                    if (stateDefinition.hasOwnProperty('template') && !parentName)
                        toInsert.templateUrl = stateDefinition.template;
                    if (stateDefinition.hasOwnProperty('controller') && !parentName)
                        toInsert.controller = stateDefinition.controller;


                    if (parentName) {

                        toInsert.views = {};
                        toInsert.views[stateDefinition.name] = {};
                        toInsert.pageTitle = parentName;
                        if (stateDefinition.hasOwnProperty('template'))
                            toInsert.views[stateDefinition.name].template = require('../views/html/' + stateDefinition.template);
                        if (stateDefinition.hasOwnProperty('controller'))
                            toInsert.views[stateDefinition.name].controller = stateDefinition.controller;
                    }

                    menus.push(toInsert)
                };


                navigation.getMenuObj = function () {
                    return menuObj;
                };
                navigation.getMenu = function () {
                    return menus;
                };
                navigation.initMenu = function (devicesStates, KramerDevice) {
                    for (var _state in devicesStates) {
                        insertInMenu(devicesStates[_state], true);

                        if (devicesStates[_state].hasOwnProperty('views')) {
                            for (var view in devicesStates[_state].views) {
                                insertInMenu(devicesStates[_state].views[view], false, devicesStates[_state].description);
                            }
                        }
                    }
                    menus.forEach(function (menu) {
                        menuObj[menu.state] = menu;

                        let resolves =  {};

                        if(menu.onLoad) {
                            menu.onLoad.forEach(function (toLoad) {
                                let newResove = {};
                                newResove[toLoad] = function () {
                                    return applicationStarter.initModule(toLoad);
                                };

                                resolves = Object.assign(resolves, newResove)
                            });
                        }
                        resolves = Object.assign(resolves, {
                            vm: function(){
                                return applicationStarter.getViewModel();
                            }
                        });
                        $state.router.stateRegistry.register({
                            name: menu.id,
                            url: '/' + menu.url,
                            parent: menu.parent,
                            component: menu.state,
                            resolve: resolves,
                            redirectTo: menu.redirectTo


                            //     menu.onLoad? menu.onLoad.forEach(function(){
                            //     return [function () {
                            //       console.log('coucou')
                            //     }]
                            // }): null
                            // RouteResolver[menu.state] || {
                            //     test: [function () {
                            //         return {test: false};
                            //     }]
                            // }
                        })

                    });

                    $urlRouter.when('', '/'+menus[0].url);
                    $urlRouter.when('/', '/'+menus[0].url);
                    $urlRouter.otherwise("/" + menus[0].url);
                    $urlRouter.sync();
                    $urlRouter.listen();
                };
                navigation.goToFirstMenu = function () {
                    $state.go(statePref + menus[0].state);
                };

                navigation.isSelected = function (menuItem) {
                    return $state.current.name.includes(menuItem.state);
                };

                navigation.cannotLeaveThisPageFlag = false;
                navigation.askBeforeLeaveThePage = false;

                navigation.setLastRequestedState = function (stateName) {
                    lastRequestedState = stateName;
                };

                navigation.navigateToSavedState = function () {
                    $state.go(lastRequestedState, null, {reload: lastRequestedState});
                };
                navigation.goToState = function (menuItem) {
                    return $state.go(statePref + menuItem.state, null, {reload: statePref + menuItem.state})
                };
                return navigation;
            }]);


// var dependencyResolve = {
//     POE: ['DeviceModel', function () {
//         return DeviceModel.modules['POE'].init();
//     }],
//     streamingOperationalGeneralSettings: ['DeviceModel', function (DeviceModel) {
//         return DeviceModel.modules['operationalGeneralSettings'].init();
//     }],
//     operationalConfiguration: ['DeviceModel', function (DeviceModel) {
//         return DeviceModel.modules['operationalConfiguration'].init();
//     }],
//     streamingOperationalRecording: ['DeviceModel', function (DeviceModel) {
//         return DeviceModel.modules['operationalRecording'].init();
//     }],
//     operationalStreaming: ['DeviceModel', function (DeviceModel) {
//         return DeviceModel.modules['operationalStreaming'].init();
//     }],
//     operationalTunnelingSettings: ['DeviceModel', function (DeviceModel) {
//         return DeviceModel.modules['operationalTunnelingSettings'].init();
//     }],
//     videoPatterns: ['DeviceModel', 'Commands',
//         function (DeviceModel) {
//             return DeviceModel.modules['videoPatterns'].init();
//             // if (!VideoService.patternInitialized())
//             //     VideoService.initPatterns();
//         }],
//     timeouts: ['DeviceModel', function (DeviceModel) {
//         return DeviceModel.modules['timeouts'].init();
//     }],
//     about: ['$ocLazyLoad', '$q', function ($ocLazyLoad, $q) {
//         return $q((resolve) => {
//             require(['../components/about/about.module'], (module) => {
//                 resolve($ocLazyLoad.load({name: module.default}))
//             });
//         });
//     }],
//     // callbackOnUpdate:['DeviceModel', function(DeviceModel){
//     //   return DeviceModel.onUpdate(msg);
//     // }],
//     matrix: ['DeviceModel', '$ocLazyLoad', '$q',
//         function (DeviceModel, $ocLazyLoad, $q) {
//             return DeviceModel.initModule('matrix')
//                 .then(function () {
//                     return $q((resolve) => {
//                         require(['../components/matrix/matrix.module'], (module) => {
//                             resolve($ocLazyLoad.load({name: module.default}).then(function () {
//                                 return DeviceModel.modules['matrix'].model;
//                             }));
//                         });
//                     });
//                 })
//         }],
//
//     globalMute: [function () {
//         if (DeviceModel.modules['globalMute'].initialized)
//             return DeviceModel.modules['globalMute'].data;
//         else
//             return DeviceModel.modules['globalMute'].init();
//     }],
//     presets: ['DeviceModel', function (DeviceModel) {
//         if (DeviceModel.modules['presets'])
//             if (DeviceModel.modules['presets'].initialized)
//                 return DeviceModel.modules['presets'].data;
//             else
//                 DeviceModel.modules['presets'].init()
//         else return {};
//     }],
//     edidObj: ['EDID_Obj', function (EDID_Obj) {
//         if (!EDID_Obj.EdidReady) {
//             return EDID_Obj.init();
//         }
//     }],
//     UniBuilder: ['$http', function ($http) {
//         return $http.get(location.origin + ":8082/")
//             .then(function () {
//                 return true
//             })
//             .catch(function () {
//                 return false
//             })
//     }],
//     // MatrixRoutes: ['DeviceModel', 'K_Port',
//     //     function (DeviceModel, K_Port) {
//     //         return DeviceModel.get_stateModel('matrix')
//     //             .then(function(data){
//     //                 console.log(data);
//     //             })
//     //         // if (DeviceModel.modules['matrix'].initialized)
//     //         //     return DeviceModel.modules['matrix'];
//     //         // else {
//     //         //     DeviceModel.modules['matrix'].inputs = K_Port.getMatrixPorts().input;
//     //         //     DeviceModel.modules['matrix'].outputs = K_Port.getMatrixPorts().output;
//     //         //     // get the matrix-status for routes
//     //         //     return DeviceModel.modules['matrix'].init();
//     //
//     //     }],
//     deviceProperties: ['DeviceModel', function (DeviceModel) {
//         return DeviceModel.modules['deviceProperties'].init();
//     }],
//
//     NTP: ['DeviceModel', function (DeviceModel) {
//         if (!DeviceModel['NTP'].initialized)
//             return DeviceModel['NTP'].init();
//         else
//             return DeviceModel['NTP']
//     }],
//     networkProperties: ['DeviceModel', function (DeviceModel) {
//         return DeviceModel.modules['networkProperties'].init();
//     }],
//     TimeZoneList: ['DeviceModel', 'Commands', function (DeviceModel, Commands) {
//         return DeviceModel.send([Commands.TIME_ZONE_LIST])
//             .then(function (data) {
//                 if (data[0].value)
//                     DeviceModel.TimeZoneList = (data[0].value.replace(/^\s+/, "")).split('\n');
//                 return DeviceModel.TimeZoneList;
//             });
//     }],
//     DevicePorts: ['DeviceModel', 'Matrix',
//         function (DeviceModel, Matrix) {
//             if (DeviceModel.modules['matrix'].initialized)
//                 return DeviceModel.modules['matrix'];
//             else {
//                 Matrix.addPort(1, 'HDMI', 1, 'output');
//                 Matrix.addPort(2, 'HDMI', 2, 'output');
//                 return DeviceModel.portsList.initPortsOverview().then(function () {
//                     return DeviceModel.portsList.getMatrixPorts();
//                 })
//             }
//         }]
//
// };