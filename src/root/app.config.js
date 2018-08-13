
(function () {
    angular.module('kramerWeb')
        .config([
        // 'ngQuickDateDefaultsProvider',
        '$provide',
        '$sceDelegateProvider',
        '$stateProvider',
        '$locationProvider',
        function (/*ngQuickDateDefaultsProvider,*/ $provide, $sceDelegateProvider, $stateProvider, $locationProvider) {

            $locationProvider.html5Mode({enabled: false});
            $sceDelegateProvider.resourceUrlWhitelist([
                'http://localhost/**',
                'self'
            ]);
            $provide.decorator('$log', ['$delegate', function ($delegate) {
                // Keep track of the original debug method, we'll need it later.
                var origDebug = $delegate.debug;
                /*
                 * Intercept the call to $log.debug() so we can add on
                 * our enhancement. We're going to add on a date and
                 * time stamp to the message that will be logged.
                 */
                $delegate.debug = function () {
                    var args = [].slice.call(arguments);
                    if (angular.isDefined(args[1])) {
                        if (args[1] == true) {
                            args = [args[0]];
                            origDebug.apply(null, args)
                        }
                    }
                    else {
                        origDebug.apply(null, args)
                    }
                };

                return $delegate;
            }]);
            $provide.decorator("$exceptionHandler", ['$delegate', '$injector', /*'MessageService',*/ function ($delegate, $injector/*, MessageService*/) {
                return function (exception, cause) {
                    $delegate(exception, cause);
                    var $rootScope = $injector.get('$rootScope');
                    $rootScope.errors = {
                        title: exception
                    };
                    if (cause && cause.message) {
                        $rootScope.errors.msg = cause ? cause.message : null;
                        $rootScope.errors.type = cause ? cause.code : null;
                        $rootScope.errors.onClose = cause.onClose ? cause.onClose : null;
                        $rootScope.errors.onCloseNot = cause.onCloseNot ? cause.onCloseNot : null;

                        // MessageService.newMessage({
                        //     title: $rootScope.errors.title || $rootScope.errors.type,
                        //     type:  $rootScope.errors.type,
                        //     isModal: true,
                        //     closeBtn: false,
                        //     body: $rootScope.errors.msg,
                        //     buttons: [{
                        //         text: MessageService.button.ok,
                        //         onClick: function () {
                        //             angular.noop();
                        //         }
                        //     }]
                        // });

                    }
                };
            }]);

            // $urlRouterProviderRef = $urlRouterProvider;
            // $urlRouterProvider.deferIntercept();
            // KApp.urlRouterProvider = $urlRouterProvider;
            // $urlRouterProvider.when('/device-settings', '/device-settings/general');
            // $urlRouterProvider.when('/operational', '/operational/settings-general');
            // $urlRouterProvider.when('', '/routing');
            // $urlRouterProvider.when('/', '/routing');
            // ngQuickDateDefaultsProvider.set({
            //     closeButtonHtml: "<i class='icon-X_White_icon' style='font-size: 11px'></i>",
            //     buttonIconHtml: "<i class='icon-calendar'></i>",
            //     nextLinkHtml: "<i class='icon-RightArrow_White_icon'></i>",
            //     prevLinkHtml: "<i class='icon-LeftArrow_Green_icon'></i>",
            //     parseDateFunction: function (str) {
            //         var seconds;
            //         var customParseDate = new Date(str);
            //         if (customParseDate.toString() === 'Invalid Date') {
            //             var from = str.split('-');
            //             var time = from[2].split(' ');
            //             customParseDate = new Date(time[0], from[1] - 1, from[0]);
            //             if (time[1]) {
            //                 var splitedtime = time[1].split(':')
            //                 customParseDate.setHours(parseInt(splitedtime[0]))
            //                 customParseDate.setMinutes(parseInt(splitedtime[1]))
            //             }
            //
            //         }
            //
            //         seconds = Date.parse(customParseDate.toString());
            //         if (isNaN(seconds)) {
            //             return null;
            //         }
            //         else {
            //             return new Date(seconds);
            //         }
            //     }
            // });




        }]);

})();