const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/js/main.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'build')
    },
    module: {
        loaders: [{
            test: /\.js$/,
            loader: 'babel-loader',
            query: {
                presets: ['es2015']
            }
        }]
    },
    stats: {
        colors: true
    },
    devtool: 'eval-source-map',
    plugins: [
        new CopyWebpackPlugin([{
            from: 'src/js/wh/processors/epg/config.json',
            to: 'js/wh/processors/epg/config.json'
        }, {
            from: 'src/js/wh/processors/epg/settings.html',
            to: 'js/wh/processors/epg/settings.html'
        },{
            from: 'src/js/wh/processors/euclidfx/config.json',
            to: 'js/wh/processors/euclidfx/config.json'
        }, {
            from: 'src/js/wh/processors/euclidfx/settings.html',
            to: 'js/wh/processors/euclidfx/settings.html'
        },{
            from: 'src/js/wh/processors/output/config.json',
            to: 'js/wh/processors/output/config.json'
        }, {
            from: 'src/js/wh/processors/output/settings.html',
            to: 'js/wh/processors/output/settings.html'
        }])
    ]
};
