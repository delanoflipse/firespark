// const webpack = require('webpack');

module.exports = function genWebpackConfig(target, production) {
	let config = {
		target,

		output: {
			path: DIRNAME,
			filename: '[name].js',
		},

		module: {
			rules: [
				{
					test: /\.js$/,
					exclude: /(node_modules|bower_components)/,
					use: ['babel-loader'],
				},
			],
		},

		stats: {
			colors: true,
		},

		devtool: production ? 'source-map' : 'cheap-module-source-map',
		mode: production ? 'production' : 'development',
		plugins: [],
	};

	return config;
};
