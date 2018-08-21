const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const WebpackShellPlugin = require('webpack-shell-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
var ngAnnotatePlugin = require('ng-annotate-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
// var ExtractTextPlugin = require("extract-text-webpack-plugin");
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
// const HtmlWebpackPlugin = require('html-webpack-plugin');


var outputPath;
if (process.env.path_for_build)
    outputPath = path.resolve(__dirname, process.env.path_for_build);
else
    outputPath = path.resolve(__dirname, 'dist');

const config = {
    devtool: 'source-map',
    entry: {
        root: [path.resolve(__dirname, 'src/index.js')]
        // pages: [path.resolve(__dirname, 'src/pages/about/about.module.js')]
    },
    output: {
        filename: '[name].js',
        path: outputPath,
        chunkFilename: "[name].js"
    },
    optimization: {

        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendors",
                    priority: -20,
                    chunks: "all"
                },
                components:{
                    test: /[\\/]components[\\/]/,
                    name: "components",
                    priority: -20,
                    chunks: "all"
                }
            }
        }
    },
    devServer: {
        contentBase: path.join(__dirname, 'devices')
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'vue-style-loader',
                    'css-loader'
                ],
            },
            {
                test: /\.less$/,
                use: [{
                    loader: MiniCssExtractPlugin.loader//('style-loader' // creates style nodes from JS strings
                }, {
                    loader: 'css-loader' // translates CSS into CommonJS
                }, {
                    loader: 'resolve-url-loader'
                }, {
                    loader: 'less-loader', // compiles Less to CSS
                    options: {
                        javascriptEnabled: true
                    }
                }]
                // })
            },
            {
                test: /\.(html)$/,
                loader: 'html-loader',
                options: {
                    loaders: {
                        // css: ExtractTextPlugin.extract({
                        //   use: 'css-loader',
                        //   fallback: 'vue-style-loader' // <- this is a dep of vue-loader, so no need to explicitly install if using npm3
                        // })
                    }
                }
            },
            {
                test: /\.js$/,
                use: [
                    { loader: 'ng-annotate-loader' },
                    { loader: 'babel-loader' },
                ],
                include:[path.join(__dirname, 'test')],
                exclude: /node_modules/
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]?[hash]'
                }
            },
            // {
            //     test: /\.json$/,
            //     loader: 'json-loader'
            // },
            {
                test: /\.(woff2?|eot|ttf|otf)$/,
                loader: 'file-loader',
                options: {
                    name: './fonts/[name].[ext]?[hash]'
                }
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({  filename: "[name].css" }),
        new webpack.ProvidePlugin({ 'window.jQuery': 'jquery', _: 'underscore' })
    ]
};



console.log(process.env.NODE_ENV);
// if (process.env.NODE_ENV == 'prod') {
//
//     config.plugins.push(  new ngAnnotatePlugin({
//         add: true,
//         // other ng-annotate options here
//     }));
//     config.plugins.push(new WebpackShellPlugin({onBuildStart: ['echo "Webpack Start"'], onBuildEnd: ['echo "Webpack End"']}));
//         //'copy "devices\\VS-88UT\\index.html" "devices\\VS-88UT\\dist"']})
// }
if(process.env.NODE_ENV == 'dev'){
    config.plugins.push(new BundleAnalyzerPlugin());
}


module.exports = config;