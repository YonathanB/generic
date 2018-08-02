angular.module('model')
    .factory('DeviceModuleFactory', [
        'Commands',
        'K_Module', function (Commands, K_Module) {
      var _modules = {
          "timeouts": "timeouts",
          "matrix": "matrix",
          "NTP": "NTP",
          "videoPatterns": "videoPatterns",
          "presets": "presets",
          "portsList": "portsList",
          "authentication": "authentication",
          "deviceProperties": "deviceProperties",
          "networkProperties": "networkProperties",
          "EDID": "EDID",
          "POE": "POE",
          "globalMute": "globalMute",
          "loadConfig": "loadConfig",
          "saveConfig": "saveConfig",
          "operationalGeneralSettings": "operationalGeneralSettings",
          "operationalConfiguration": "operationalConfiguration",
          "operationalStreaming": "operationalStreaming",
          "operationalTunnelingSettings": "operationalTunnelingSettings",
          "operationalRecording": "operationalRecording"
      }


        return {
          modules: _modules
        }
    }]);