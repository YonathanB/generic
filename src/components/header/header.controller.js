
class headerCtrl {
    constructor() {
        'ngInject';
        this.$onInit = function() {
            // deviceModel.getData().then(function(){

            console.log(this)
            // })
        };
        this.$onChanges = function (changes) {
            console.log(changes);
        };

    }
}
export default headerCtrl;