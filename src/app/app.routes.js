import {applicationService, deviceModel} from "../core/model/applicationService";
// import $oclazyLoad from 'oclazyload';


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
                            controller: ['$rootScope', '$scope', '$timeout', '$http', '$q', 'MainService', '$transitions',
                                function ($rootScope, $scope, $timeout, $http, $q, MainService, $transitions) {

                                    // MainService.then(function () {
                                    //     $scope.vm = applicationService.getModel()
                                    // });

                                    $transitions.onStart({}, function (transition) {
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
                                }]
                        }
                    }

                })

        }])
    .factory("ViewSettingsFactory", ['$state', '$urlRouter',
        function ($state, $urlRouter) {
            let menus = [];

            return {
                initMenu: initMenu,
                getMenu: getMenu
            };


            function getMenu() {
                return menus;
            }

            function initMenu(devicesStates) {
                for (let _state in devicesStates) {
                    menus.push(devicesStates[_state]);
                    $state.router.stateRegistry.register({
                        name: devicesStates[_state].id,
                        url: '/' + devicesStates[_state].url,
                        parent: devicesStates[_state].parent ? devicesStates[_state].parent : 'main',
                        component: devicesStates[_state].id,
                        resolve: function () {
                            return _routeResolver(devicesStates[_state].onLoad);
                        }(),
                        redirectTo: devicesStates[_state].redirectTo,

                        data: function () {
                            return _additionalData(devicesStates[_state]);
                        }(),

                        lazyLoad: ($transition$) => {
                            const $ocLazyLoad = $transition$.injector().get("$ocLazyLoad");
                            if (devicesStates[_state].id == 'about') {
                                // return require.ensure([], () => {
                                // load whole module
                                const module = require("../pages/" + devicesStates[_state].id + "/" + devicesStates[_state].id + ".module");

                                return $ocLazyLoad.inject(module.default);
                                // }, devicesStates[_state].id + ".module");
                            }
                        }
                    })
                }

                $urlRouter.when('', '/' + devicesStates[0].url);
                $urlRouter.when('/', '/' + devicesStates[0].url);
                $urlRouter.otherwise("/" + devicesStates[0].url);
                $urlRouter.sync();
                $urlRouter.listen();
            }
        }]);


function _routeResolver(onLoad) {
    let resolves = {};
    if (onLoad) {
        onLoad.forEach(function (toLoad) {
            let newResolve = {};
            newResolve[toLoad] = function () {
                return applicationService.initModule(toLoad);
            };

            resolves = Object.assign(resolves, newResolve)
        });
    }
    resolves = Object.assign(resolves, {
        model: function () {
            return deviceModel;
        }
    });
    return resolves;
}
function _additionalData(state) {
    let toReturn = {};
    toReturn.description = state.description;
    toReturn.icon = state.icon;
    return toReturn;
}