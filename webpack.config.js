const webpack = require("webpack")
const path = require("path")

let config = {
    target: "web",

    output: {
        path: __dirname,
        filename: 'js/[name].js'
    },
    
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: [
                    'babel-loader',
                ]
            },
        ]
    },
    
    stats: {
        colors: true
    },

    plugins: [],
}

module.exports = function(prod) {
    config.devtool = prod ? 'source-map' : 'cheap-module-source-map'
    
    if (prod) {
        config.plugins.push(
            new webpack.optimize.UglifyJsPlugin({
                sourceMap: true,
                compress: {
                    warnings: false
                }
            })
        )
    }

    return config
}