import $matrix from "./matrix/matrix.module";
import $about from "./about/about.module";
import $header from "./header/header.module";
import $deviceSettings from "./settings/settings.module";
import $widgets from "./widgets/widgets.module";


export default require('angular')
    .module('components.module', [$widgets, $matrix, $about, $deviceSettings, $header])
    .name;
