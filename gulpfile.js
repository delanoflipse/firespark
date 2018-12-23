// Requirements
const nodemon = require('gulp-nodemon');
const proxy = require('express-http-proxy');
const gulp = require('gulp');
const express = require('express');
const sass = require('gulp-sass');
const plumber = require("gulp-plumber");
const htmlmin = require("gulp-htmlmin");
const sourcemaps = require('gulp-sourcemaps');
const named = require('vinyl-named');
const webpack = require("webpack");
const path = require("path");
const webpackStream = require("webpack-stream");

const configGen = require('./.firespark');
let config = {};

let targetFolder = 'build';

// STATIC
gulp.task('static', function () {
    return gulp.src(config.static.input + "/**/*")
        .pipe(gulp.dest(targetFolder + "/" + config.static.output))
});

// HTML
gulp.task('html', function () {
    return gulp.src(config.src.html.input)
        .pipe(plumber())
        .pipe(htmlmin(config.src.html.config))
        .pipe(gulp.dest(path.join(__dirname, targetFolder, config.src.html.output)))
});

// Javascript clientside
gulp.task("javascript-client", function() {
    return gulp.src(config.src.js.input)
        .pipe(plumber())
        .pipe(named())
        .pipe(webpackStream(config.src.js.webpack, webpack))
        .pipe(gulp.dest(path.join(__dirname, targetFolder, config.src.js.output)))
});

// Javascript server
gulp.task("javascript-lib", function() {
    return gulp.src(config.src.lib.input)
        .pipe(plumber())
        .pipe(named())
        .pipe(webpackStream(config.src.lib.webpack, webpack))
        .pipe(gulp.dest(path.join(__dirname, targetFolder, config.src.lib.output)))
});

// SASS
gulp.task('sass', function () {
    return gulp.src(config.src.sass.input)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest(path.join(__dirname, targetFolder, config.src.sass.output)))
});

// Watch task
gulp.task('watch', function(done) {
    gulp.watch(config.src.js.watch, ['javascript-client']);
    gulp.watch(config.src.lib.watch, ['javascript-lib']);
    gulp.watch(config.src.html.watch, ['html']);
    gulp.watch(config.src.sass.watch, ['sass']);
    gulp.watch(config.static.input + "/**/*", ['static']);

    // Dev proxy server
    const app = express();

    app.use('/', proxy('localhost:9090/'));
    app.use((req, res) => {
        res.send("Server not started!");
    })

    app.listen(8080, () => {
        console.log("Proxy server started on port 8080");
    });

    nodemon({
        script: path.join(__dirname, 'build', config.src.lib.runpath),
        args: [ '9090' ],
        ext: 'js',
        env: { 'NODE_PATH': path.join(__dirname, 'build') },
        done,
    });
});

// DEV
gulp.task('dev', ['setDev', 'javascript-lib', 'javascript-client', 'html', 'sass', 'static', 'watch']);
gulp.task('setDev', function() {
    config = configGen(false);
    targetFolder = config.output.build;
});

// PROD
gulp.task('prod', ['setProd', 'static', 'html', 'javascript-lib', 'javascript-client','sass']);
gulp.task('setProd', function() {
    config = configGen(true);
    targetFolder = config.output.distribution;
});


// Default task
gulp.task('default', ['dev']);
