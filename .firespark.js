const webpack = require("webpack");
// const path = require("path");

module.exports = (production) => ({
    // static files
    static: {
        input: "static",
        output: "/frontend",
    },

    // source files
    src: {
        // client side Javascript
        js: {
            input: [
                "./src/js/index.js"
            ],
            output: "/frontend/js",
            watch: [
                "./src/js/*.js",
                "./src/js/*.json",
            ],
            webpack: genWebpackConfig('web', production),
        },

        // server side Javascript
        lib: {
            input: "./src/lib/index.js",
            output: "/",
            runpath: "/index.js",
            watch: [
                "./src/lib/*.js",
                "./src/lib/*.json",
            ],
            webpack: genWebpackConfig('node', production),
        },
        
        // client side SASS
        sass: {
            input: [
                "./src/sass/index.scss",
            ],
            output: "/frontend/css",
            watch: [
                "./src/**/*.scss"
            ],
        },

        // client side HTML
        html: {
            input: [
                "./src/*.html",
            ],
            output: "/frontend/",
            watch: [
                "./src/**/*.html",
            ],
            config: {
                // check out https://github.com/kangax/html-minifier
                removeComments: true,
                preserveLineBreaks: false,
                collapseWhitespace: true,
            },
        },
    },

    // build & dist
    output: {
        build: "build",
        distribution: "dist",
    },
});

function genWebpackConfig(target, production) {
    let config = {
        target,
    
        output: {
            path: __dirname,
            filename: '[name].js'
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
            colors: true,
        },

        devtool: production ? 'source-map' : 'cheap-module-source-map',
    
        plugins: [],
    }
        
    if (production) {
        config.plugins.push(
            new webpack.optimize.UglifyJsPlugin({
                sourceMap: true,
                compress: {
                    warnings: false
                }
            }),
        );
    }

    return config;
}
