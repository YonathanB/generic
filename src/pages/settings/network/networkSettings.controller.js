import {deviceCommands} from "../../../core/data/Commands";
import AbstractPageCtrl from "../../abstractPage.controller";

let _networkProperties = {
    'dhcp': deviceCommands.NET_DHCP.key,
    'ip': deviceCommands.NET_IP.key,
    'mask': deviceCommands.NET_MASK.key,
    'gateway': deviceCommands.NET_GATE.key,
    'port': deviceCommands.ETH_PORT.key
};


export default class NetworkSettingsCtrl extends AbstractPageCtrl{
    constructor($scope) {
        super($scope, _networkProperties);
        let $ctrl = this;

    }
}