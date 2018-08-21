import $widgets from "./widgets/widgets.module";


export default require('angular')
    .module('components.module', [$widgets])
    .name;
