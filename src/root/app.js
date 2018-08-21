import {applicationStarter} from "../model/applicationStarter";


// (function () {
'use strict';
/**
 * @memberof kramerWeb
 * @name run
 * @param {service} $http
 * @param {service}  DeviceModel create modules and starts communication
 * @param {factory}  ViewSettingsFactory create states of the app
 * @description
 *    Will Load the infoFile from device then send it to the DeviceModel
 *    When communication open, it will create the page of our app
 *
 */
angular.module('kramerWeb')
    .run([function () {
        console.log('run function')
    }])


    .controller('appCtrl', [
        '$scope',
        '$rootScope',
        'ViewSettingsFactory',
        '$timeout',
        '$state',
        'MessageService',
        'MainService',
        '$log',
        function ($scope, $rootScope, ViewSettingsFactory, $timeout, $state, MessageService, MainService, $log) {

            // MainService.then(function () {


                $scope.vm = applicationStarter.getViewModel();


            // });
            // $scope.deviceStatus = applicationStarter.STATUS;


            MessageService.subscribe(function (data) {
                if (angular.isUndefined($scope.messageData)) {
                    $scope.messageData = data;
                }
            });
            $rootScope.$on("CONNECTION_LOST", function () {
                var htmlMsg = '<p>Communication with device has been closed.</p>' +
                    '<p>Trying to retrieve connection.<span class="loader-btn connection-pbm"></span></p>';
                var title = 'Communication error';

                showErrorPopup(title, htmlMsg);
            });
            $rootScope.$on("CONNECTION_FAILED", function () {
                var htmlMsg = '<p>Can\'t communicate with device.</p>' +
                    '<p>Please check if device is connected to network</p>';
                var title = 'Communication error';

                showErrorPopup(title, htmlMsg);

            });

            function showErrorPopup(title, htmlMsg) {
                MessageService.newMessage({
                    title: title,
                    type: 'error',
                    isModal: true,
                    closeBtn: false,
                    body: htmlMsg
                });
            }

            var counterTimeout;
            var _updateCounter = function () {
                if ($scope.mainViewConfig.counter > 0) {
                    $scope.mainViewConfig.counter--;
                    counterTimeout = $timeout(_updateCounter, 1000);
                }
            };
            $rootScope.launchGlobalMessage = function (msg, counter) {
                $scope.mainViewConfig.globalInfo = true;
                $scope.mainViewConfig.msg = msg;

                if (angular.isUndefined($scope.mainViewConfig.counter) && angular.isDefined(counter)) {
                    $scope.mainViewConfig.counter = counter;
                    _updateCounter();
                }

            };


            // $scope.isAuthenticationEnabled = Authentication.get;
            $scope.menuItems = ViewSettingsFactory.getMenu();
            $scope.kLoader = {active: false};
            $scope.InitialMenuIndex = -1;
            $scope.enableLocalLoader = function () {
                $scope.kLoader.active = true;
            }
            $scope.disableLocalLoader = function () {
                $scope.kLoader.active = false;
            }

            $scope.webVersion = '@version';

            $scope.mainViewConfig = {};
            $scope.mainViewConfig.globalInfo = false;

            $scope.model = {};
            $rootScope.debugLogEnable = false;

            $scope.enableDebug = function () {
                $rootScope.debugLogEnable = false;
            }

            $scope.setError = function (msg) {
                $scope.errorMessage = msg;
            }


            // $rootScope.$on('$stateChangeStart',
            //     function (event, toState, toParams, fromState, fromParams) {
            //         $scope.enableLocalLoader();
            //     }
            // )
            // $rootScope.$on('$stateChangeError',
            //     function (event, toState, toParams, fromState, fromParams) {
            //         event.preventDefault();
            //         console.log('State error');
            //         $scope.disableLocalLoader();
            //     }
            // )
            // $rootScope.$on('$stateChangeSuccess',
            //     function (event, toState, toParams, fromState, fromParams) {
            //         $rootScope.pageTitle = toState.data.pageTitle;
            //         $scope.disableLocalLoader();
            //     });
            // MessageService.subscribe(function (data) {
            //     if (angular.isUndefined($scope.messageData) || data == null) {
            //         $scope.messageData = data;
            //     }
            // })
            $scope.fileSystemEnable = function () {
                return !(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream);
            };

            // httpCommunicationServiceFactory.queriesGroupManager.addGroup("app", true);
            // //When device startup
            // httpCommunicationServiceFactory.queriesGroupManager.addQueryToGroup("app", ["^~[0-9]+@coldstart"], function (reply) {
            //     communicationJsonManagerServiceFactory.unSyncDeviceStatus();
            //     $scope.deviceConnected = true;
            //     $scope.changeTemplateURLTab($scope.mainViewConfig.selectedTab);
            //     $rootScope.$broadcast('templateUrlBroadcast', $scope.viewConfigurationJson.menus[$scope.mainViewConfig.selectedTab].templateURL);
            // });
            //

            $scope.mainViewConfig.isLocalHost = false;
            $scope.mainViewConfig.selectedTab = 1;
            $scope.mainViewConfig.TemplateURLTab = 1;
            $scope.mainViewConfig.isTabFinishLoadingTemplate = false;
            $scope.mainViewConfig.firmwareUpgradeRunning = false;
            $rootScope.clearCacheDialogShow = false;

            $scope.activeCallbacks = [];

            $scope.changeTemplateURLTab = function (index) {
                $scope.mainViewConfig.isTabFinishLoadingTemplate = false;
                $scope.mainViewConfig.transactionError = false;
                $scope.mainViewConfig.TemplateURLTab = null;
                $timeout(function () {
                    if (isDebug) {
                        $scope.mainViewConfig.TemplateURLTab = "partials/html/" + $scope.viewConfigurationJson.menus[index].templateURL;
                    } else {
                        $scope.mainViewConfig.TemplateURLTab = $scope.viewConfigurationJson.menus[index].templateURL;
                    }
                    $scope.mainViewConfig.templateTitle = $scope.viewConfigurationJson.menus[index].description;
                });
            };

            $scope.deviceConnected = true;

            // httpCommunicationServiceFactory.connectionLostHandler = function () {
            //     $log.debug("connection lost", $rootScope.debugLogEnable);
            //     communicationJsonManagerServiceFactory.unSyncDeviceStatus();
            //     $scope.deviceConnected = false;
            // };
            // httpCommunicationServiceFactory.connectionRecoverHandler = function () {
            //     $log.debug("connection Recover", $rootScope.debugLogEnable);
            //     $scope.changeTemplateURLTab($scope.mainViewConfig.selectedTab);
            //     $rootScope.$broadcast('templateUrlBroadcast', $scope.viewConfigurationJson.menus[$scope.mainViewConfig.selectedTab].templateURL);
            //     $scope.deviceConnected = true;
            // };

            // httpTransactionFactory.setHandlersTo('menu');
            // httpTransactionFactory.handlers['menu'].transactionStartHandler = function (numOfCommands) {
            //     $log.debug("transactionStartHandler", $rootScope.debugLogEnable);
            //     if (numOfCommands > 0) {
            //         $scope.mainViewConfig.isLoading = true;
            //     }
            // };
            //
            // httpTransactionFactory.handlers['menu'].transactionFinishHandler = function () {
            //     $log.debug("transactionFinishHandler", $rootScope.debugLogEnable);
            //     $timeout(function () {
            //         $scope.mainViewConfig.isLoading = false;
            //     }, 500);
            // };
            //
            // httpTransactionFactory.handlers['menu'].transactionTimeoutHandler = function () {
            //     $log.debug("transactionTimeoutHandler", $rootScope.debugLogEnable);
            //     $scope.mainViewConfig.isLoading = false;
            //     $scope.mainViewConfig.transactionError = true;
            // };

            $rootScope.refreshTheTab = function () {
                window.location.reload();
                //$scope.changeTemplateURLTab($scope.mainViewConfig.selectedTab);
                //$rootScope.$broadcast('templateUrlBroadcast', $scope.viewConfigurationJson.menus[$scope.mainViewConfig.selectedTab].templateURL);
            };
            $scope.closeErrorMessage = function (userChoice) {
                if (userChoice) {
                    if ($scope.error.onClose)
                        $scope.error.onClose();
                }
                else {
                    if ($scope.error.onCloseNot)
                        $scope.error.onCloseNot();
                }
                $scope.error = null;
            };

            $rootScope.$watch('errors', function (val) {
                if (val)
                    if (val.msg) $scope.error = val;
            });
            $scope.loadingConfig = false;
            $scope.savingConfig = false;
            $scope.saveConfig = function () {
                $scope.savingConfig = true;
                $rootScope.saveKCD().finally(function () {
                    $scope.savingConfig = false;
                })
            };
            $scope.loadConfig = function () {
                $timeout(function () {
                    angular.element('input#load-config-hidden').click();
                }, 0);
            };
            $scope.loadConfigFile = function (el) {
                $scope.loadingConfig = true;
                $rootScope.loadKCD(el).finally(function () {
                    location.reload();
                    $scope.loadingConfig = false;
                })
            };

        }])

//
//
//
//     .controller('mainContentCtrl', [
//         '$scope',
//         '$log',
//         '$rootScope',
//         '$timeout',
//         function ($scope, $log, $rootScope, $timeout) {
//
//
//             // httpCommunicationServiceFactory.queriesGroupManager.addGroup("app", true);
//             // //When device startup
//             // httpCommunicationServiceFactory.queriesGroupManager.addQueryToGroup("app", ["^~[0-9]+@coldstart"], function (reply) {
//             //     communicationJsonManagerServiceFactory.unSyncDeviceStatus();
//             //     $scope.deviceConnected = true;
//             //     $scope.changeTemplateURLTab($scope.mainViewConfig.selectedTab);
//             //     $rootScope.$broadcast('templateUrlBroadcast', $scope.viewConfigurationJson.menus[$scope.mainViewConfig.selectedTab].templateURL);
//             // });
//             //
//
//             $scope.mainViewConfig.isLocalHost = false;
//             $scope.mainViewConfig.selectedTab = 1;
//             $scope.mainViewConfig.TemplateURLTab = 1;
//             $scope.mainViewConfig.isTabFinishLoadingTemplate = false;
//             $scope.mainViewConfig.firmwareUpgradeRunning = false;
//             $rootScope.clearCacheDialogShow = false;
//
//             $scope.activeCallbacks = [];
//
//             $scope.changeTemplateURLTab = function (index) {
//                 $scope.mainViewConfig.isTabFinishLoadingTemplate = false;
//                 $scope.mainViewConfig.transactionError = false;
//                 $scope.mainViewConfig.TemplateURLTab = null;
//                 $timeout(function () {
//                     if (isDebug) {
//                         $scope.mainViewConfig.TemplateURLTab = "partials/html/" + $scope.viewConfigurationJson.menus[index].templateURL;
//                     } else {
//                         $scope.mainViewConfig.TemplateURLTab = $scope.viewConfigurationJson.menus[index].templateURL;
//                     }
//                     $scope.mainViewConfig.templateTitle = $scope.viewConfigurationJson.menus[index].description;
//                 });
//             };
//
//             $scope.deviceConnected = true;
//
//             // httpCommunicationServiceFactory.connectionLostHandler = function () {
//             //     $log.debug("connection lost", $rootScope.debugLogEnable);
//             //     communicationJsonManagerServiceFactory.unSyncDeviceStatus();
//             //     $scope.deviceConnected = false;
//             // };
//             // httpCommunicationServiceFactory.connectionRecoverHandler = function () {
//             //     $log.debug("connection Recover", $rootScope.debugLogEnable);
//             //     $scope.changeTemplateURLTab($scope.mainViewConfig.selectedTab);
//             //     $rootScope.$broadcast('templateUrlBroadcast', $scope.viewConfigurationJson.menus[$scope.mainViewConfig.selectedTab].templateURL);
//             //     $scope.deviceConnected = true;
//             // };
//
//             // httpTransactionFactory.setHandlersTo('menu');
//             // httpTransactionFactory.handlers['menu'].transactionStartHandler = function (numOfCommands) {
//             //     $log.debug("transactionStartHandler", $rootScope.debugLogEnable);
//             //     if (numOfCommands > 0) {
//             //         $scope.mainViewConfig.isLoading = true;
//             //     }
//             // };
//             //
//             // httpTransactionFactory.handlers['menu'].transactionFinishHandler = function () {
//             //     $log.debug("transactionFinishHandler", $rootScope.debugLogEnable);
//             //     $timeout(function () {
//             //         $scope.mainViewConfig.isLoading = false;
//             //     }, 500);
//             // };
//             //
//             // httpTransactionFactory.handlers['menu'].transactionTimeoutHandler = function () {
//             //     $log.debug("transactionTimeoutHandler", $rootScope.debugLogEnable);
//             //     $scope.mainViewConfig.isLoading = false;
//             //     $scope.mainViewConfig.transactionError = true;
//             // };
//
//             $rootScope.refreshTheTab = function () {
//                 window.location.reload();
//                 //$scope.changeTemplateURLTab($scope.mainViewConfig.selectedTab);
//                 //$rootScope.$broadcast('templateUrlBroadcast', $scope.viewConfigurationJson.menus[$scope.mainViewConfig.selectedTab].templateURL);
//             };
//             $scope.closeErrorMessage = function (userChoice) {
//                 if (userChoice) {
//                     if ($scope.error.onClose)
//                         $scope.error.onClose();
//                 }
//                 else {
//                     if ($scope.error.onCloseNot)
//                         $scope.error.onCloseNot();
//                 }
//                 $scope.error = null;
//             };
//
//             $rootScope.$watch('errors', function (val) {
//                 if (val)
//                     if (val.msg) $scope.error = val;
//             });
//             $scope.loadingConfig = false;
//             $scope.savingConfig = false;
//             $scope.saveConfig = function () {
//                 $scope.savingConfig = true;
//                 $rootScope.saveKCD().finally(function () {
//                     $scope.savingConfig = false;
//                 })
//             };
//             $scope.loadConfig = function () {
//                 $timeout(function () {
//                     angular.element('input#load-config-hidden').click();
//                 }, 0);
//             };
//             $scope.loadConfigFile = function (el) {
//                 $scope.loadingConfig = true;
//                 $rootScope.loadKCD(el).finally(function () {
//                     location.reload();
//                     $scope.loadingConfig = false;
//                 })
//             };
//
//         }]);
//
// // })();