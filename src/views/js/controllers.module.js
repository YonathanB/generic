import $model from '../../services/model.module';
// import $widgets from '../../components/widgets/widgets.module';


import  '../../assets/styles/variables.less'
import '../less/deviceSettings.less';


export default require('angular')
    .module('web.controllers', [$model])
    .name;

require('./avConfig');
require('./deviceSettings');
require('./edid');
require('./FrameManager');
require('./networkSettings');
require('./operational');
require('./roomController');
// require('./routing');
require('./switcher');