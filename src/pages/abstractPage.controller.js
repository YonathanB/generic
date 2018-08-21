
export default class AbstractPageCtrl {
    constructor($scope, properties) {
        this.vm = {};
        this.scope = $scope;
        this.properties = properties;
    }
    $onChanges(changes) {
        for(let prop in this.properties) {
            this.vm[prop] = this.model.data[this.properties[prop]];
        }
    };

    $onInit() {
        for(let prop in this.properties) {
            this.scope.$watch(() => this.model.data[this.properties[prop]],
                (newValue, oldValue) => {
                    if (newValue !== oldValue) {
                        this.vm[prop] = this.model.data[this.properties[prop]];
                    }
                });
        }
    };

}