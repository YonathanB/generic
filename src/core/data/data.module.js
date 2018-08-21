
import $parser from '../parsers/parsers.module';
import $communication from '../communication/communication.module';
// import {Connectors, CommandsFactory} from './Commands'

export default require('angular')
    .module('core.data', [$parser, $communication])
    // .factory("Connectors", Connectors)
    // .factory("Commands", CommandsFactory)
    .name;

require('./DataProxy');
require('./DataBackup');
