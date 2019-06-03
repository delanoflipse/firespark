const path = require('path');
const webutil = require('../util/webpack');

module.exports = {
	dependencies: ['webpack-stream', 'webpack'],

	init({ production }) {
		this.webpack = require('webpack-stream');
		this.webpack2 = require('webpack');
		this.webconfig = webutil('web', production);
	},

	task: function web() {
		const { config, plumber, sourcemaps, targetFolder, gulp, named } = this.ctx;

		return gulp
			.src(config.input.js.input)
			.pipe(plumber())
			.pipe(named())
			.pipe(this.webpack(this.webconfig, this.webpack2))
			.pipe(sourcemaps.init({ loadMaps: true }))
			.pipe(
				gulp.dest(path.join(DIRNAME, targetFolder, config.input.js.output))
			);
	},
};
