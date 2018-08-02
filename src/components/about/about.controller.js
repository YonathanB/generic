import webVersion from '../../../devices/VS-88UT/version.json'

class aboutCtrl {
    constructor() {
        'ngInject';
        this.$onInit = function() {
            console.log(this)
        };
        this.$onChanges = function (changes) {
           console.log(changes);
        };

        this.webVersion = webVersion;
        this.year = new Date().getFullYear();
    }
}
export default aboutCtrl;
