const path = require('path');

module.exports = {
	dependencies: ['autoprefixer', 'gulp-stylus', 'gulp-postcss'],

	init() {
		this.stylus = require('gulp-stylus');
		this.postcss = require('gulp-postcss');
		this.autoprefixer = require('autoprefixer');
	},

	task: function css() {
		const {
			config,
			plumber,
			sourcemaps,
			devMode,
			targetFolder,
			gulp,
		} = this.ctx;

		const { stylus, autoprefixer, postcss } = this;

		return (
			gulp
				.src(config.input.css.input)
				.pipe(plumber())
				// .pipe(this.sourcemaps.init())
				// .pipe(sass().on('error', sass.logError))
				.pipe(sourcemaps.init())
				.pipe(
					stylus({
						compress: !devMode,
					})
				)
				.pipe(postcss([autoprefixer()]))
				.pipe(sourcemaps.write())
				.pipe(
					gulp.dest(path.join(DIRNAME, targetFolder, config.input.css.output))
				)
		);
	},
};
