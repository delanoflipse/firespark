// Requirements
const JSON5 = require('json5')
const fs = require('fs')
const gulp = require('gulp')
const liveServer = require('live-server')
const gutil = require("gulp-util")
const sass = require('gulp-sass')
const uglify = require('gulp-uglify')
const plumber = require("gulp-plumber")
const htmlmin = require("gulp-htmlmin")
const notify = require("gulp-notify")
const sourcemaps = require('gulp-sourcemaps')
const named = require('vinyl-named')
const webpack = require("webpack")
const path = require("path")
const webpackConfigGenerator = require("./webpack.config.js")
const webpackStream = require("webpack-stream")

const firesparkConfig = parseConfig()

let targetFolder = 'build'
let webpackConfig
const basePath = path.resolve(__dirname, "src")

let server = null

// STATIC
gulp.task('static', function () {
    return gulp.src(firesparkConfig.static.input + "/**/*")
        .pipe(gulp.dest(targetFolder + "/" + firesparkConfig.static.output))
})

// HTML
gulp.task('html', function () {
    return gulp.src(firesparkConfig.src.html.input)
        .pipe(plumber())
        .pipe(htmlmin(firesparkConfig.src.html.config))
        .pipe(gulp.dest(targetFolder))
})

// Javascript
gulp.task("javascript", function() {
    return gulp.src(firesparkConfig.src.js.input)
        .pipe(plumber())
        .pipe(named())
        .pipe(webpackStream(webpackConfig, webpack))
        .pipe(gulp.dest(targetFolder))
})

// Sass
gulp.task('sass', function () {
    return gulp.src(firesparkConfig.src.sass.input)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest(targetFolder + '/css'))
})

gulp.task('watch', function() {
    gulp.watch(firesparkConfig.src.js.watch, ['javascript'])
    gulp.watch(firesparkConfig.src.html.watch, ['html'])
    gulp.watch(firesparkConfig.src.sass.watch, ['sass'])
    gulp.watch(firesparkConfig.static.input + "/**/*", ['static'])
    
    liveServer.start({
        port: 8080, // Set the server port. Defaults to 8080. 
        root: "build", // Set root directory that's being served. Defaults to cwd. 
        open: true,
    })
})

gulp.task('setDev', function() {
    targetFolder = firesparkConfig.output.build
    webpackConfig = webpackConfigGenerator(false)
})

gulp.task('dev', ['setDev', 'javascript', 'html', 'sass', 'static', 'watch'])

gulp.task('setProd', function() {
    targetFolder = firesparkConfig.output.distribution
    webpackConfig = webpackConfigGenerator(true)
})

gulp.task('prod', ['setProd', 'static', 'html', 'javascript', 'sass'])

// Default task
gulp.task('default', ['dev'])

function parseConfig() {
    let file = fs.readFileSync(".firespark", { encoding: "UTF-8" }) || ""
    return JSON5.parse(file)
}
