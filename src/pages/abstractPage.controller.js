import {deviceCommands} from "../core/data/Commands";

let _self;
export default class AbstractPageCtrl {
    constructor($scope, properties) {
        _self = this;
        _self.vm = {};
        _self.scope = $scope;
        _self.properties = properties;
    }
    $onChanges(changes) {
        for(let prop in _self.properties) {
            if(_self.model.data[_self.properties[prop]] !== Object(_self.model.data[_self.properties[prop]]))
                _self.vm[prop] = _self.model.data[_self.properties[prop]];
            else
                _self.vm[prop] = Object.assign({}, _self.model.data[_self.properties[prop]]);
        }
    };

    $onInit() {
        this.vm.actions = this.model.actions;
        for(let prop in this.properties) {
            this.scope.$watch(() => this.model.data[this.properties[prop]],
                (newValue, oldValue) => {
                    if (newValue !== oldValue) {
                        if(_self.model.data[_self.properties[prop]] !== Object(_self.model.data[_self.properties[prop]]))
                            this.vm[prop] = _self.model.data[_self.properties[prop]];
                        else
                            this.vm[prop] = Object.assign({}, _self.model.data[_self.properties[prop]]);
                    }
                }, true);
        }
    };


    update(data){
        console.log(data, _self.properties)
    }
}