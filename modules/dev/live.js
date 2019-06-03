const path = require('path');

module.exports = {
	dependencies: ['live-server'],

	init() {
		this.liveServer = require('live-server');
	},

	watch: function devLive(cb) {
		console.log('Setting up live server for web development...');

		// Dev live server
		this.liveServer.start({
			port: 8080, // Set the server port. Defaults to 8080.
			root: path.join(DIRNAME, 'build'), // Set root directory that's being served. Defaults to cwd.
			open: true,
			wait: 100,
		});

		cb();
	},
};
