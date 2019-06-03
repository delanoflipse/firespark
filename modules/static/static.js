const path = require('path');

module.exports = {
	task: function content() {
		const { config, targetFolder, gulp } = this.ctx;

		return gulp
			.src(config.input.static.input + '/**/*')
			.pipe(
				gulp.dest(path.join(DIRNAME, targetFolder, config.input.static.output))
			);
	},
};
