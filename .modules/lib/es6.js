const path = require('path');
const fs = require('fs');
const webutil = require('../util/webpack');

module.exports = {
	dependencies: ['webpack-stream', 'webpack'],

	init({ production }) {
		this.webpack = require('webpack-stream');
		this.webpack2 = require('webpack');
		this.webconfig = webutil('node', production);
	},

	task: function lib() {
		const { config, plumber, sourcemaps, targetFolder, gulp, named } = this.ctx;

		const nodeModules = {};

		fs.readdirSync('node_modules')
			.filter(function(x) {
				return ['.bin'].indexOf(x) === -1;
			})
			.forEach(function(mod) {
				nodeModules[mod] = 'commonjs ' + mod;
			});

		this.webconfig.externals = nodeModules;

		return gulp
			.src(config.input.lib.input)
			.pipe(plumber())
			.pipe(named())
			.pipe(this.webpack(this.webconfig, this.webpack2))
			.pipe(sourcemaps.init({ loadMaps: true }))
			.pipe(
				gulp.dest(path.join(DIRNAME, targetFolder, config.input.lib.output))
			);
	},
};
