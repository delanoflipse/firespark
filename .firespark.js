const webpack = require("webpack");

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
        
        // client side STYLUS
        css: {
            input: [
                "./src/css/index.styl",
            ],
            output: "/frontend/css",
            watch: [
                "./src/**/*.styl"
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
        mode: production ? 'production' : 'development',
        plugins: [],
    }

    return config;
}
