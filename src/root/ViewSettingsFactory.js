/***********************************************
 * File Name: _stateSettingsServiceFactory.js
 * Created by: Chezi Hoyzer
 * On: 02/10/2014  16:35
 * Last Modified: 02/10/2014
 * Modified by: Choyzer
 ***********************************************/

/**
 * Created by Choyzer on 30/8/2016.
 */

isDebug = (process.env.NODE_ENV === 'development');
(function () {
    angular.module('kramerWeb')
        .factory("ViewSettingsFactory", ['$state', '$urlRouter', 'RouteResolver',
            function ($state, $urlRouter, RouteResolver) {
                var __states = {};
                var navigation = {};
                var urlPrefix = "/";
                var statePref = "main.";
                var lastRequestedState = '';
                var menuObj = {};
                var menus = [];

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


                var insertInMenu = function (stateDefinition, inMenuTab, parentName) {
                    var toInsert = {};
                    toInsert.state = stateDefinition.id;
                    toInsert.id = stateDefinition.id;
                    toInsert.url = stateDefinition.url;
                    toInsert.description = stateDefinition.description;
                    toInsert.menuTab = inMenuTab;
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
                        $state.router.stateRegistry.register({
                            name: menu.id,
                            url: '/' + menu.url,
                            parent: menu.parent,
                            component: menu.state,
                            resolve: RouteResolver[menu.state] || {
                                test: [function () {
                                    return {test: false};
                                }]
                            }
                        })

                    });


                    console.info(menuObj)
                    // $stateProviderRef.state(statePref + menu.state,

                    // app.urlRouterProvider.when('', '/'+menus[0].url);
                    // app.urlRouterProvider.when('/', '/'+menus[0].url);
                    // app.urlRouterProvider.otherwise("/" + menus[0].url);
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
})();





