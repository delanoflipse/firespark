'use strict'

const webpack = require('webpack')
const path = require('path')
const autoprefixer = require('autoprefixer')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

let extractStyles = new ExtractTextPlugin('[name].css')
let extractHtml = new ExtractTextPlugin('[name].html')

let config = {
    stats: {
        assets: false,
        colors: true,
        version: false,
        hash: true,
        timings: true,
        chunks: false,
        chunkModules: false
    },
    entry: {
        index: [
            path.resolve(__dirname, 'views/pages/index.pug')
        ],
        'js/index': [
            path.resolve(__dirname, 'js/index.js')
        ],
        'css/index': [
            path.resolve(__dirname, 'sass/index.scss')
        ]
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /\.pug$/,
                use: extractHtml.extract({
                    use: ['html-loader', 'pug-html-loader?pretty&exports=false']
                })
            },
            {
                test: /\.scss$/,
                use: extractStyles.extract({
                    use: [
                        {
                            loader: 'css-loader'
                        },
                        {
                            loader: 'postcss-loader'
                        },
                        {
                            loader: 'sass-loader'
                        }
                    ]
                })
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [{
                    loader: 'babel-loader',
                    options: {
                        presets: ['stage-0', "es2015"],
                        plugins: ["transform-class-properties"]
                    },
                }],
            },
        ]
    },
    plugins: [
        new webpack.LoaderOptionsPlugin({
            minimize: false,
            debug: true,
            options: {
                postcss: [
                    autoprefixer({
                        browsers: ['last 2 version', 'Explorer >= 10', 'Android >= 4']
                    })
                ],
                sassLoader: {
                    includePaths: [
                        path.resolve(__dirname, 'node_modules/sanitize.css/')
                    ]
                }
            }
        }),
        extractStyles,
        extractHtml
    ]
}

module.exports = config