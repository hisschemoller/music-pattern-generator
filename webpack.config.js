var path = require('path');
var webpack = require('webpack');
var GhPagesWebpackPlugin = require('gh-pages-webpack-plugin');

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
        new GhPagesWebpackPlugin({
            path: './build',
            options: {
                message: 'Update GitHub Pages',
                user: {
                    name: 'Wouter Hisschemöller',
                    email: 'wouter.hiscchemoller@gmail.com'
                }
            }
        })
    ]
};
