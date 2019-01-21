// Requirements
const path = require("path");
const fs = require('fs');
const rmrf = require('rimraf');

const express = require('express');
const proxy = require('express-http-proxy');

const gulp = require('gulp');
const stylus = require('gulp-stylus');
const plumber = require("gulp-plumber");
const htmlmin = require("gulp-htmlmin");
const sourcemaps = require('gulp-sourcemaps');
const nodemon = require('gulp-nodemon');
const named = require('vinyl-named');

const webpack = require("webpack-stream");
const webpack2 = require('webpack');

const liveServer = require('live-server');

// Config generator
const configGen = require('./.firespark');
let config = {};

// Track target folder
let targetFolder = 'build';
let devMode = true;

// STATIC
gulp.task('static', function (cb) {
    if (!config.static) return cb();

    return gulp.src(config.static.input + "/**/*")
        .pipe(gulp.dest(targetFolder + "/" + config.static.output))
});

// HTML
gulp.task('html', function (cb) {
    if (!config.src || !config.src.html) return cb();

    return gulp.src(config.src.html.input)
        .pipe(plumber())
        .pipe(htmlmin(config.src.html.config))
        .pipe(gulp.dest(path.join(__dirname, targetFolder, config.src.html.output)))
});

// Javascript clientside
gulp.task("javascript-client", function (cb) {
    if (!config.src || !config.src.js) return cb();

    return gulp.src(config.src.js.input)
        .pipe(plumber())
        .pipe(named())
        .pipe(webpack(config.src.js.webpack, webpack2))
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(gulp.dest(path.join(__dirname, targetFolder, config.src.js.output)))
});

// Javascript server
gulp.task("javascript-lib", function(cb) {
    if (!config.src || !config.src.lib) return cb();

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

// CSS
gulp.task('css', function(cb) {
    if (!config.src || !config.src.css) return cb();

    return gulp.src(config.src.css.input)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        // .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.init())
        .pipe(stylus({
            compress: !devMode,
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.join(__dirname, targetFolder, config.src.css.output)))
});

// Watch task
gulp.task('watch-js-client', function(cb) {
    if (!config.src || !config.src.js) return cb();

    gulp.watch(config.src.js.watch, gulp.series('javascript-client'));
    cb();
});

gulp.task('watch-js-lib', function(cb) {
    if (!config.src || !config.src.lib) return cb();

    gulp.watch(config.src.lib.watch, gulp.series('javascript-lib'));
    cb();
});

gulp.task('watch-html', function(cb) {
    if (!config.src || !config.src.html) return cb();

    gulp.watch(config.src.html.watch, gulp.series('html'));
    cb();
});

gulp.task('watch-css', function(cb) {
    if (!config.src || !config.src.css) return cb();

    gulp.watch(config.src.css.watch, gulp.series('css'));
    cb();
});

gulp.task('watch-static', function(cb) {
    if (!config.static) return cb();

    gulp.watch(config.static.input + "/**/*", gulp.series('static'));
    cb();
});

gulp.task('watch-lib-server', function(done) {
    if (!config.src || !config.src.lib) return done();
    console.log("Setting up nodemon for custom server...");
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

gulp.task('watch-live-server', function(done) {
    if (config.src && config.src.lib) return done();
    console.log("Setting up live server for web development...");

    // Dev live server
    liveServer.start({
        port: 8080, // Set the server port. Defaults to 8080. 
        root: "build", // Set root directory that's being served. Defaults to cwd. 
        open: true,
        wait: 100,
    });
    done();
});

gulp.task('watch', gulp.parallel('watch-js-client', 'watch-js-lib', 'watch-html', 'watch-css', 'watch-static', 'watch-lib-server', 'watch-live-server'));

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
    devMode = true;
    targetFolder = config.output.build;
    rmrf(config.output.build, cb);
});
gulp.task('dev', gulp.series('setDev', gulp.parallel('static', 'html', 'javascript-client', 'css'), 'javascript-lib', 'watch'));

// PROD
gulp.task('setProd', (cb) => {
    config = configGen(true);
    devMode = false;
    targetFolder = config.output.distribution;
    rmrf(config.output.distribution, cb);
});

gulp.task('prod', gulp.series('setProd', gulp.parallel('static', 'html', 'javascript-client', 'css'), 'javascript-lib', 'generatePackageJSON'));

// Default task
gulp.task('default', gulp.series('dev'));
