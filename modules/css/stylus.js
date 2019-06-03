const path = require('path');

module.exports = {
	dependencies: ['postcss-loader', 'gulp-stylus'],

	init() {
		this.stylus = require('gulp-stylus');
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
		const { stylus } = this;

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
				.pipe(sourcemaps.write())
				.pipe(
					gulp.dest(path.join(DIRNAME, targetFolder, config.input.css.output))
				)
		);
	},
};
