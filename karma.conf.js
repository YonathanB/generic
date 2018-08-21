var webpackConfig = require('./webpack.config');
const merge = require('deepmerge');

module.exports = function(config) {
    config.set({
        browsers:   [ 'Chrome'],//TODO - to use 'PhantomJS' we may need to include es-6 polyfills
        frameworks: ['mocha'],
        reporters:  ['mocha', 'coverage'],

        logLevel: config.LOG_INFO,
        autoWatch: true,
        singleRun: true,
        colors: true,
        port: 9876,

        basePath: '',
        files: [
            'webpack.karma.context.js',
            {pattern : './test/resources/info', served: true, included: false}
        ],
        preprocessors: {
            'webpack.karma.context.js': ['webpack', 'coverage']
        },
        coverageReporter: {
            type : 'html',
            dir : 'coverage/'
        },
        exclude: [],
        webpack: { ...webpackConfig, optimization: undefined },

        webpackMiddleware: {
            noInfo: true
        }
    });
};