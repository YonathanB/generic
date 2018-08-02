const $ = require("jquery");
window.$ = $;
window.jQuery = $;

import ngMessages from 'angular-messages'
export default require('angular')
    .module('components.widgets', ['ngMessages'])
    .name;

require('./kButton');
require('./kBrowse'); // needs kButton & kContentButton
require('./kContentButton');
require('./kIp');
require('./kIpSet');
require('./kInput');// k-ip needs kInputRange
require('./kInputRange');// k-ip needs kInputRange
require('./kOnOff');
require('./kForm');
require('./kVerticalSideMenu');
require('./kVerticalSlider');
require('./kDialog');
require('./MessageService');