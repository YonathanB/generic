import {applicationService} from "../core/model/applicationService";

export default require('angular')
    .module('kServices', [])
    .service('MainService', ['ViewSettingsFactory', function (ViewSettingsFactory) {
        return applicationService.start().then(function (infoFile) {
            ViewSettingsFactory.initMenu(infoFile.states);
            document.getElementsByTagName("body")[0].style.display = 'block';
        });
    }])
    .name;