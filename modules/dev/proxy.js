// utilities
const path = require('path');

module.exports = {
	dependencies: ['express', 'express-http-proxy', 'gulp-nodemon'],

	init() {
		this.express = require('express');
		this.proxy = require('express-http-proxy');
		this.nodemon = require('gulp-nodemon');
	},

	watch: function devProxy(cb) {
		const { config } = this.ctx;
		console.log('Setting up nodemon for custom server...');

		// Dev proxy server
		const app = this.express();

		app.use('/', this.proxy('localhost:9090/'));
		app.use((_, res) => {
			res.send('Server not started!');
		});

		app.listen(8080, () => {
			console.log('Proxy server started on port 8080');
		});

		this.nodemon({
			script: path.join(DIRNAME, 'build', config.input.lib.runpath),
			args: ['9090'],
			ext: 'js',
			env: { NODE_PATH: path.join(DIRNAME, 'build') },
			watch: [config.input.lib.runpath],
			done: cb,
		});
	},
};
