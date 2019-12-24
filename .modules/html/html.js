const path = require('path');

module.exports = {
	dependencies: ['gulp-htmlmin'],

	init() {
		this.htmlmin = require('gulp-htmlmin');
	},

	task: function html() {
		const { config, plumber, targetFolder, gulp } = this.ctx;

		return gulp
			.src(config.input.html.input)
			.pipe(plumber())
			.pipe(this.htmlmin(config.input.html.config))
			.pipe(
				gulp.dest(path.join(DIRNAME, targetFolder, config.input.html.output))
			);
	},
};
