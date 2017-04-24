/**
 * Created by crow on 2016/8/18.
 */

/*jshint esversion: 6 */
const packageInfo = require('./package.json');
const webpack = require('webpack');


const entryPath = __dirname + '/src-es6/mrc.js';
const outputPath = __dirname + '/build/' + packageInfo.version;
const fileName = packageInfo.main;


let infoArr = [packageInfo.name, packageInfo.author, packageInfo.version, packageInfo.description];
let banner = infoArr.join('\n');

module.exports = {
    entry: entryPath,
    output: {
        path: outputPath,
        libraryTarget: 'umd',
        filename: fileName
    },
    module: {
        loaders: [
            {
                test: /\.js/,
                exclude: /node_modules/,
                loader: "babel-loader"
            },
            {
                test: /\.json/,
                exclude: /node_modules/,
                loader: "json-loader"
            }
        ]
    },
    plugins: [
        new webpack.BannerPlugin(banner),
        // new webpack.optimize.UglifyJsPlugin({compress: {warnings: false}})
    ]
};