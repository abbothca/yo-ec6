var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    context: __dirname + "/dev/assets",
    entry: ['./js/main.js', './scss/application.scss'
    ],
    output: {
        path: path.resolve(__dirname, 'build/js'),
        filename: '[name].bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                }
            },
            {
                test: /\.js$/,
                exclude: [/node_modules/, /build/],
                loader: 'eslint-loader'
            },
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract({
                    fallbackLoader: "style-loader",
                    loader: "css-loader!sass-loader"
                })
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin('../css/style.css')
    ],
    watch: true,
    watchOptions: {
        aggregateTimeout: 300,
        poll: 1000
    },
    stats: {
        colors: true
    },
    devtool: 'source-map'
};