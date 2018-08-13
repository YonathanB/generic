var webpackConfig = require('./webpack.config');
const merge = require('deepmerge');
// delete webpackConfig.entry;
// var path = require('path');
// var entry = path.resolve(webpackConfig.context, webpackConfig.entry.root[0]);
// var preprocessors = {};
// preprocessors[entry] = ['webpack'];
module.exports = function(config) {
    config.set({
        browsers:   ['Chrome'],
        frameworks: ['mocha'],
        reporters:  ['mocha', 'coverage'],

        logLevel: config.LOG_INFO,
        autoWatch: true,
        singleRun: false,
        colors: true,
        port: 9876,

        basePath: '',
        files: [
            'webpack.karma.context.js',
            // './dist/vendors.main.js',
            // './dist/components.main.js',
            // './dist/root.main.js',
            // './node_modules/chai/chai.js',
            // './node_modules/angular-mocks/angular-mocks.js'
            // './test/*.spec.js'
        ],
        preprocessors: {
            'webpack.karma.context.js': ['webpack', 'coverage'],
            // './dist/vendors.main.js': ['webpack'],,
            // './dist/components.main.js': ['webpack'],
            // './dist/root.main.js': ['webpack'],
            // './test/*.spec.js': ['webpack']
        },
        coverageReporter: {
            type : 'html',
            dir : 'coverage/'
        },
        exclude: [],
        webpack: { ...webpackConfig, optimization: undefined },
        // webpack: webpackConfig,
        //     merge(webpackConfig, {
        //     optimization: {
        //         splitChunks: false,
        //         runtimeChunk: false
        //     }
        // }),
        webpackMiddleware: {
            noInfo: true
        }
    });
};