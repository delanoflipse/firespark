// Requirements
const gulp = require('gulp')
const liveServer = require('live-server')
const gutil = require("gulp-util")
const sass = require('gulp-sass')
const uglify = require('gulp-uglify')
const notify = require("gulp-notify")
const sourcemaps = require('gulp-sourcemaps')
const named = require('vinyl-named')
const webpack = require("webpack")
const path = require("path")
const webpackConfigGenerator = require("./webpack.config.js")
const webpackStream = require("webpack-stream")
const firesparkConfig = require("./firespark.json")

if (!firesparkConfig.js || !firesparkConfig.sass || !firesparkConfig.html) {
    console.error("Fatal error: invalid config!")
    process.exit()
}

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
    return gulp.src("src/*.html")
        .pipe(gulp.dest(targetFolder))
})

// Javascript
gulp.task("javascript", function() {
    return gulp.src("src/js/*.js")
        .pipe(named())
        .pipe(webpackStream(webpackConfig, webpack))
        .pipe(gulp.dest(targetFolder))
})

// Sass
gulp.task('sass', function () {
    return gulp.src('./src/sass/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest(targetFolder + '/css'))
})

gulp.task('watch', function() {
    gulp.watch("src/**/*.js", ['javascript'])
    gulp.watch("src/**/*.html", ['html'])
    gulp.watch("src/**/*.scss", ['sass'])
    gulp.watch(firesparkConfig.static.input + "/**/*", ['static'])
    
    liveServer.start({
        port: 8080, // Set the server port. Defaults to 8080. 
        // host: "0.0.0.0", // Set the address to bind to. Defaults to 0.0.0.0 or process.env.IP. 
        root: "build", // Set root directory that's being served. Defaults to cwd. 
        open: true,
    })
})

gulp.task('setDev', function() {
    targetFolder = 'build'
    webpackConfig = webpackConfigGenerator(false)
})

gulp.task('dev', ['setDev', 'javascript', 'html', 'sass', 'static', 'watch'])

gulp.task('setProd', function() {
    targetFolder = 'dist'
    webpackConfig = webpackConfigGenerator(true)
})

gulp.task('prod', ['setProd', 'static', 'html', 'javascript', 'sass'])

// Default task
gulp.task('default', ['dev'])
