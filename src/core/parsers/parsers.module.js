
export default require('angular')
    .module('core.parsers', [])
    .name;

require('./ParserFactory');
require('./P3K_Parser');
require('./Y_Parser');

