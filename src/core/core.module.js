import $communication from './communication/communication.module';
import $data from './data/data.module';
import $parsers from './parsers/parsers.module';

export default require('angular')
    .module('core', [$communication, $data, $parsers])
    .name;