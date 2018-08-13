const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const WebpackShellPlugin = require('webpack-shell-plugin');
// var ExtractTextPlugin = require("extract-text-webpack-plugin");
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
// const HtmlWebpackPlugin = require('html-webpack-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;


var outputPath;
if (process.env.path_for_build)
    outputPath = path.resolve(__dirname, process.env.path_for_build);
else
    outputPath = path.resolve(__dirname, 'dist');

console.log(outputPath);
const config = {
    entry: {
        root: [path.resolve(__dirname, 'src/index.js')]
    },
    output: {
        filename: '[name].main.js',
        path: outputPath,
        chunkFilename: "[name].main.js"
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
        // publicPath: '/some/sub-path/'
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
                // loader: "style-loader!css-loader!less-loader"
                // use: extractLess.extract({autoprefixer-loader
                //     fallback: 'style-loader',
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
                loader: 'babel-loader',
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
    // optimization: {
    //     splitChunks: {
    //         cacheGroups: {
    //             commons: {
    //                 test: /[\\/]node_modules[\\/]/,
    //                 name: 'vendor',
    //                 chunks: 'all'
    //             }
    //         }
    //     }
    // },
    plugins: [
        // new BundleAnalyzerPlugin(),
        new WebpackShellPlugin({onBuildStart: ['echo "Webpack Start"'], onBuildEnd: ['echo "Webpack End"']}),//'copy "devices\\VS-88UT\\index.html" "devices\\VS-88UT\\dist"']}),
        new MiniCssExtractPlugin({
            filename: "[name].css",
        }),
        new webpack.ProvidePlugin({
            'window.jQuery': 'jquery',
            // Promise: 'es6-promise-promise',
            _: 'underscore'
        })

    ]
};
module.exports = config;