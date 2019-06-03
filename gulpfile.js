// utilities
const path = require('path');
const fs = require('fs');
const rmrf = require('rimraf');

const gulp = require('gulp');
const plumber = require('gulp-plumber');
const sourcemaps = require('gulp-sourcemaps');
const named = require('vinyl-named');
const install = require('gulp-install');

// Config generator
let config = require('./.firespark');

// Track target folder
let targetFolder = 'build';
let devMode = true;

// set base dir
global.DIRNAME = path.resolve(__dirname);

// No-operation with callback
const noop = cb => {
	cb();
};

// Module reference
const toolkit = {
	// keep set of references
	dependencies: new Set(),
	// keep list of modules
	modules: [],
	// setup base task
	task: {
		js: noop,
		lib: noop,
		css: noop,
		html: noop,
		static: noop,
		dev: noop,
	},
	// watch tasks
	watch: [],
};

// Default to these modules.
const defaultModules = {
	css: 'stylus',
	dev: 'proxy',
	html: 'html',
	js: 'es6',
	lib: 'es6',
	static: 'static',
};

// Create a new package.json, remove all unnecesairy dependencies after building
function genPackageJSON(cb) {
	const content = fs.readFileSync('package.json');
	const json = JSON.parse(content);
	delete json.optionalDependencies;
	delete json.devDependencies;

	json.scripts = {
		start: 'node index',
	};

	json.main = 'index.js';

	fs.writeFile(
		path.join(DIRNAME, targetFolder, 'package.json'),
		JSON.stringify(json, null, 4),
		cb
	);
}

// update the project package.json based on modules
function updatePackage(cb) {
	const content = fs.readFileSync('package.json');
	const json = JSON.parse(content);

	json.optionalDependencies = {};
	Array.from(toolkit.dependencies).forEach(
		x => (json.optionalDependencies[x] = 'latest')
	);

	fs.writeFile(
		path.join(DIRNAME, 'package.json'),
		JSON.stringify(json, null, 4),
		cb
	);
}

// install dependencies
function installDepedencies() {
	return gulp.src(['./package.json']).pipe(install());
}

// add a module to the build project
function addModule(module, key, config, conf = {}) {
	module.ctx = {
		gulp,
		config,
		plumber,
		named,
		sourcemaps,
		devMode,
		targetFolder,
	};

	// add task
	if (typeof module.task === 'function') {
		toolkit.task[key] = module.task.bind(module);
	}

	// add watch task
	if (typeof module.watch === 'function') {
		toolkit.watch.push(module.watch.bind(module));
	} else if (conf.watch && typeof module.task === 'function') {
		// generate watch task if information is complete
		const str = `watch-${key}`;
		const x = {
			[str]: function(cb) {
				gulp.watch(conf.watch, gulp.series(module.task.bind(module)));
				cb();
			},
		};

		toolkit.watch.push(x[str]);
	}

	// add dependencies
	if (Array.isArray(module.dependencies)) {
		module.dependencies.forEach(x => toolkit.dependencies.add(x));
	}

	// keep reference
	toolkit.modules.push(module);
}

// call all init functions (used for dynamic imports)
function initModules(cb) {
	toolkit.modules.forEach(module => {
		if (typeof module.init === 'function') {
			module.init.bind(module)({ config, production: !devMode });
		}
	});

	cb();
}

// add all modules based on config
function parseConfig() {
	for (const key in config.input) {
		const conf = config.input[key];
		let modname = (conf.module = defaultModules[key]);
		const module = require(`./modules/${key}/${modname}.js`);

		addModule(module, key, config, conf);
	}

	if (devMode) {
		const devmodus = config.input && config.input.lib ? 'proxy' : 'live';
		const module = require(`./modules/dev/${devmodus}.js`);
		addModule(module, 'dev', config);
	}
}

// create a pipeline
function defaultPipeline(cb) {
	const pipeline = [
		initModules,
		gulp.parallel(
			toolkit.task.static,
			toolkit.task.html,
			toolkit.task.js,
			toolkit.task.css
		),
		toolkit.task.lib,
	];

	if (devMode) {
		pipeline.push(gulp.parallel(...toolkit.watch));
	}

	if (!devMode) {
		pipeline.push(genPackageJSON);
	}

	gulp.series(...pipeline)();
	cb();
}

// DEV Pipeline
const dev = gulp.series(devSetup, defaultPipeline);
function devSetup(cb) {
	devMode = true;
	targetFolder = config.output.build;
	parseConfig(config);
	cb();
}

// PROD Pipeline
const prod = gulp.series(prodSetup, defaultPipeline);
function prodSetup(cb) {
	devMode = false;
	targetFolder = config.output.distribution;
	parseConfig(config);
	rmrf(config.output.distribution, cb);
}

// Dependency management
function installDep(cb) {
	devMode = true;
	targetFolder = config.output.build;
	parseConfig(config);

	gulp.series(updatePackage, installDepedencies)();
	cb();
}

// Export tasks
exports.install = installDep;
exports.default = dev;
exports.dev = dev;
exports.prod = prod;
