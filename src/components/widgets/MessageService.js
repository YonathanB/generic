/***********************************************
 * File Name:
 * Created by: Yonathan Benitah
 * On: 26/04/2017  15:24
 * Last Modified: 26/04/2017
 * Modified by: ybenitah
 ***********************************************/
(function () {
    angular.module('components.widgets')
        .factory('MessageService', [
            function () {
                var _subscribers = [];


                var MessageService = {};

//START MessageService API


                MessageService.newMessage = function (data) {
                    angular.forEach(_subscribers, function (cb) {
                        cb(data);
                    });
                };


                MessageService.type = {
                    "alert": 0,
                    "error": 1,
                    "success": 2,
                    "info": 3
                };

                MessageService.button = {
                    "ok": "OK",
                    "cancel": "Cancel",
                    "save": "Save",
                    "yes": "YES",
                    "no": "NO"
                };


                MessageService.subscribe = function (cb) {
                    _subscribers.push(cb);
                };
//END MessageService API


                return MessageService;
            }])
})();