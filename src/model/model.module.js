
import {applicationStarter} from "./applicationStarter";

export default require('angular')
    .module('model', [])
    .service('MainService', ['ViewSettingsFactory', function(ViewSettingsFactory){
       return applicationStarter.start().then(function (infoFile) {
            ViewSettingsFactory.initMenu(infoFile.states, applicationStarter);
                document.getElementsByTagName("body")[0].style.display = 'block';
        });
    }])
    .name;