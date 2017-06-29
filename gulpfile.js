'use strict';

const gulp = require("gulp")
const yaml = require("js-yaml")
const fs = require("fs")
const pug = require("pug")
const path = require("path")
const sass = require("node-sass")
const webpack = require("webpack")
const connect = require("gulp-connect")
const BabiliPlugin = require("babili-webpack-plugin")
const CleanCSS = require('clean-css');

let config = null
let PRODUCTION = false

gulp.task('update config', reloadConfig)

function reloadConfig() {
    try {
        config = yaml.safeLoad(fs.readFileSync('./config.yaml', 'utf8'))
        console.log(config)
    } catch (e) {
        console.log(e)
    }
}

gulp.task('render views', function() {
    try {
        for(let inFile in config.pug.entries) {
            let outFile = config.pug.entries[inFile]
            let html = pug.renderFile(__dirname + "/" + inFile, config.pug.data)
            fs.writeFile(__dirname + "/build/" + outFile, html, function(){})
        }

    } catch (e) {
        console.log(e)
    }
})

gulp.task('compile scripts', function() {
    try {
        for(let inFile in config.js.entries) {
            let outFile = config.js.entries[inFile]
            let outPath = path.parse(path.join(__dirname + "/build/js/" + outFile))
            
            let webconf = {
                entry: ['babel-polyfill', __dirname + "/" + inFile],
                devtool: "eval",
                output: {
                    filename: outPath.base,
                    path: outPath.dir,
                },
                module: {
                    loaders: [
                        {
                            test: /\.js$/,
                            exclude: /node_modules/,
                            loader: "babel",
                            query: {
                                presets: ['stage-0', "es2015"],
                                plugins: ["transform-class-properties"]
                            }
                        },
                        { test: /\.pug$/, loader: "pug" },
                        { test: /\.jade$/, loader: "pug" },
                        { test: /\.yaml$/, loader: "yaml" },
                        { test: /\.json$/, loader: "json" }
                    ]
                }
            }

            if (PRODUCTION) {
                webconf.plugins = [
                    new BabiliPlugin(options)
                ]
            }
            
            webpack(webconf, function(err, stats) {
                if(err) {
                    console.log(err)
                }
                console.log(stats.toString("minimal"))
            })
        }
    } catch (e) {
        console.log(e)
    }
})

gulp.task('compile css', function() {
    try {
        for(let inFile in config.sass.entries) {
            let outFile = config.sass.entries[inFile]
            fs.readFile(__dirname + "/" + inFile, 'utf8', function(err, data) {
                if(err) {
                    console.log(err)
                    return
                }
                sass.render({
                    data: data,
                    includePaths: [__dirname + "/sass"]
                }, function(err, result) {
                    let output = result.css
                    if(err) {
                        console.log(err)
                        return
                    }
                    
                    if (PRODUCTION) {
                        output = new CleanCSS({
                            compatibility: '*',
                        }).minify(output)
                    }

                    fs.writeFile(__dirname + "/build/css/" + outFile, output, function(){})
                })
            })
        }
        
    } catch (e) {
        console.log(e)
    }
})

gulp.task('reload', function() {
    return gulp.src("build/**/*").pipe(connect.reload())
})

gulp.task('build', ['render views', "compile css", "compile scripts"])

gulp.task('default', ['update config', 'build'], function() {
    connect.server({
        name: 'App',
        root: 'build',
        port: 8080,
        livereload: true
    })

    gulp.start('build')

    gulp.watch('config.yaml', ["update config"]);
    gulp.watch('views/pages/**/*', ["render views"]);
    gulp.watch('sass/**/*', ["compile css"]);
    gulp.watch('js/**/*', ["compile scripts"]);

    gulp.watch('build/**/*', ['reload'])
})

