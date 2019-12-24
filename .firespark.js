const staticOutput = '/frontend';
const frontendOutput = '/frontend';

module.exports = {
	input: {
		// client side Javascript
		js: {
			input: ['./src/js/index.js'],
			output: `${frontendOutput}/js`,
			watch: ['./src/js/*.js', './src/js/*.json'],
		},

		// server side Javascript
		lib: {
			input: './src/lib/index.js',
			output: '/',
			runpath: '/index.js',
			watch: ['./src/lib/*.js', './src/lib/*.json'],
		},

		// client side STYLUS
		css: {
			input: ['./src/css/index.styl'],
			output: `${frontendOutput}/css`,
			watch: ['./src/**/*.styl'],
		},

		// client side HTML
		html: {
			input: ['./src/*.html'],
			output: `${frontendOutput}/`,
			watch: ['./src/**/*.html'],
			config: {
				// check out https://github.com/kangax/html-minifier
				removeComments: true,
				preserveLineBreaks: false,
				collapseWhitespace: true,
			},
		},

		// static files
		static: {
			input: 'static',
			watch: './static/**/*.*',
			output: staticOutput,
		},
	},

	// build & dist
	output: {
		build: 'build',
		distribution: 'dist',
	},
};
