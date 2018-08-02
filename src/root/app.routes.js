// (function () {
    angular.module('kramerWeb')
    // 'DeviceModel'
        .factory('RouteResolver', [ '$ocLazyLoad','$q',
            function ( $ocLazyLoad, $q) {
            var RouteResolver = this;
            RouteResolver['deviceSettings'] = {
                vm: function () {
                    console.log('RouteResolver', KramerDevice);
                    return true; //DeviceModel.modules['deviceProperties'].init();

                }
            };
            // RouteResolver['networkSettings'] = {
            //     vm: function () {
            //         return DeviceModel.modules['networkProperties'].init();
            //         // return DeviceModel.modules['timeouts'].init();
            //     }
            // };
            // RouteResolver['routing'] = {
            //     vm: function () {
            //         return DeviceModel.modules['matrix'].init();
            //         // return DeviceModel.modules['timeouts'].init();
            //     }
            // };
            //
            // RouteResolver['about'] = {
            //     // template: function(){
            //     //     return $q((resolve) => {
            //     //         require(['../components/about/about.module'], (module) => {
            //     //             resolve($ocLazyLoad.load({name: module.default}))
            //     //         });
            //     //     });
            //     // },
            //     vm: function () {
            //         return DeviceModel.modules['deviceProperties'].init();
            //     }
            // };


            return RouteResolver;
        }])

        .config(['$stateProvider',
            function ($stateProvider) {
                $stateProvider
                    .state({
                        name: 'main',
                        abstract: true,
                        url: '',
                        // resolve:{
                        //     TimeZoneList:['deviceModel', 'Commands',function (deviceModel, Commands) {
                        //         return deviceModel.send([ Commands.TIME_ZONE_LIST])
                        //             .then(function (data) {
                        //                 if(data[0].value)
                        //                     deviceModel.TimeZoneList = (data[0].value.replace(/^\s+/,"")).split('\n');
                        //             return deviceModel.TimeZoneList;
                        //         });
                        //     }],
                        // },
                        views: {
                            'mainView@': {
                                template: '<ui-view/>',
                                controller: function ($rootScope, $scope, $timeout, $http, $q, Commands) {
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
// })();