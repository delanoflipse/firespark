// Requirements
const path = require("path");
const fs = require('fs');

const nodemon = require('gulp-nodemon');
const proxy = require('express-http-proxy');
const gulp = require('gulp');
const express = require('express');
const sass = require('gulp-sass');
const plumber = require("gulp-plumber");
const htmlmin = require("gulp-htmlmin");
const sourcemaps = require('gulp-sourcemaps');
const named = require('vinyl-named');
const webpack = require("webpack-stream");
const webpack2 = require('webpack');

// Config generator
const configGen = require('./.firespark');
let config = {};

// Track target folder
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
gulp.task("javascript-client", function () {
    return gulp.src(config.src.js.input)
        .pipe(plumber())
        .pipe(named())
        .pipe(webpack(config.src.js.webpack, webpack2))
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(gulp.dest(path.join(__dirname, targetFolder, config.src.js.output)))
});

// Javascript server
gulp.task("javascript-lib", function() {
    const nodeModules = {};

    fs.readdirSync('node_modules')
    .filter(function(x) {
        return ['.bin'].indexOf(x) === -1;
    })
    .forEach(function(mod) {
        nodeModules[mod] = 'commonjs ' + mod;
    });
    
    config.src.lib.webpack.externals = nodeModules;
    return gulp.src(config.src.lib.input)
        .pipe(plumber())
        .pipe(named())
        .pipe(webpack(config.src.lib.webpack, webpack2))
        .pipe(sourcemaps.init({loadMaps: true}))
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
    gulp.watch(config.src.js.watch, gulp.series('javascript-client'));
    gulp.watch(config.src.lib.watch, gulp.series('javascript-lib'));
    gulp.watch(config.src.html.watch, gulp.series('html'));
    gulp.watch(config.src.sass.watch, gulp.series('sass'));
    gulp.watch(config.static.input + "/**/*", gulp.series('static'));

    // Dev proxy server
    const app = express();

    app.use('/', proxy('localhost:9090/'));
    app.use((_, res) => {
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
        watch: [ config.src.lib.runpath ],
        done,
    });
});

gulp.task('generatePackageJSON', (cb) => {
    const content = fs.readFileSync('package.json');
    const json = JSON.parse(content);
    json.devDependencies = {};
    json.scripts = {
        'start': "node index",
    };
    json.main = 'index.js';

    fs.writeFile(path.join(__dirname, targetFolder, 'package.json'), JSON.stringify(json, null, 4), cb);
})

// DEV
gulp.task('setDev', (cb) => {
    config = configGen(false);
    targetFolder = config.output.build;
    cb();
});
gulp.task('dev', gulp.series('setDev', gulp.parallel('static', 'html', 'javascript-client', 'sass'), 'javascript-lib', 'watch'));

// PROD
gulp.task('setProd', (cb) => {
    config = configGen(true);
    targetFolder = config.output.distribution;
    cb();
});
gulp.task('prod', gulp.series('setProd', gulp.parallel('static', 'html', 'javascript-client', 'sass'), 'javascript-lib', 'generatePackageJSON'));

// Default task
gulp.task('default', gulp.series('dev'));
