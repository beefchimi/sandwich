// Variables / Environment Setup
// ----------------------------------------------------------------------------

// gulp requires
var gulp        = require('gulp'),
	del         = require('del'),
	pngcrush    = require('imagemin-pngcrush'),
	// secrets     = require('./secrets.json'),
	sequence    = require('run-sequence'),
	browserSync = require('browser-sync').create(),
	plugins     = require('gulp-load-plugins')({
		pattern: ['gulp-*', 'gulp.*'],
		replaceString: /\bgulp[\-.]/
	});

// source / destination paths
var paths = {

	haml: {
		src  : 'dev/haml/',
		dest : 'build/'
	},
	styles: {
		src  : 'dev/styles/',
		dest : 'build/assets/css/'
	},
	scripts: {
		src  : 'dev/scripts/*.js',
		vndr : 'dev/scripts/vendor/*.js',
		dest : 'build/assets/js/'
	},
	images: {
		src  : 'dev/media/images/*.{png,jpg,gif}',
		dest : 'build/assets/img/'
	},
	audio: {
		src  : 'dev/media/audio/*.*',
		dest : 'build/assets/aud/'
	},
	videos: {
		src  : 'dev/media/videos/*.*',
		dest : 'build/assets/vid/'
	},
	svg: {
		src  : 'dev/media/svg/*.svg',
		dest : 'build/assets/img/svg.svg'
	},
	misc: {
		root : 'dev/extra/root/',
		dest : 'build/'
	},
	fonts: {
		src  : 'dev/extra/fonts/*',
		dest : 'build/assets/fonts/'
	}

};


// Delete all build files except images, since those take awhile to compress
// ----------------------------------------------------------------------------
gulp.task('clean', function() {

	console.log('clean task is deleting the images folder, so it has been disabled until this can be resolved');
	// del(['build/**/*', '!build/assets/img', '!build/assets/img/*.{png,jpg,gif}']);

});


// Compress (if changed) all of our images
// ----------------------------------------------------------------------------
gulp.task('images', function() {

	return gulp.src(paths.images.src)
		.pipe(plugins.changed(paths.images.dest))
		.pipe(plugins.imagemin({
			optimizationLevel: 7,
			progressive: true,
			use: [pngcrush()]
		}))
		.pipe(gulp.dest(paths.images.dest));

});


// Compress and build SVG sprite (make ready for injection)
// ----------------------------------------------------------------------------
gulp.task('svg', function() {

	return gulp.src(paths.svg.src)
		.pipe(plugins.imagemin({
			svgoPlugins: [{
				removeViewBox: false,
				removeUselessStrokeAndFill: false
			}]
		}))
		.pipe(plugins.svgstore({
			inlineSvg: true
		}))
		.pipe(gulp.dest(paths.images.dest));

});


// Compile and Output Styles
// ----------------------------------------------------------------------------
gulp.task('styles', function() {

	return gulp.src(paths.styles.src + 'styles.scss')
		.pipe(plugins.sourcemaps.init())
			.pipe(plugins.sass({
				outputStyle: 'compact'
			}).on('error', plugins.sass.logError))
			.pipe(plugins.autoprefixer({
				browsers: ['last 3 version', 'ios 6', 'android 4']
			}))
			.pipe(plugins.minifyCss())
			.pipe(plugins.rename({
				suffix: '.min'
			}))
		.pipe(plugins.sourcemaps.write('../maps'))
		.pipe(gulp.dest(paths.styles.dest))
		.pipe(browserSync.stream({match: '**/*.css'}));

});


// Concat and output custom scripts
// ----------------------------------------------------------------------------
gulp.task('scripts', function() {

	return gulp.src(paths.scripts.src)
		.pipe(plugins.sourcemaps.init())
			.pipe(plugins.concat('scripts.min.js')) // plugins require a numbered prefix to specify load order
			.pipe(plugins.uglify()) // Sourcemaps: FF doesn't play nice, but Chrome is fine
		.pipe(plugins.sourcemaps.write('../maps'))
		.pipe(gulp.dest(paths.scripts.dest));

});


// Compile only main HAML files (ignore partials - included via the main files), then inject SVG sprite
// ----------------------------------------------------------------------------
gulp.task('haml', function() {

	// would be ideal to only inject / compile changed files

	var srcSVG = gulp.src(paths.svg.dest);

	function fileContents(filePath, file) {
		return file.contents.toString();
	}

	return gulp.src(paths.haml.src + '*.haml')
		.pipe(plugins.rubyHaml())
		.pipe(plugins.inject(srcSVG, {
			transform: fileContents
		}))
		.pipe(gulp.dest(paths.haml.dest));

});


// Watch over HAMNL files and reload the browser upon compilation
// ----------------------------------------------------------------------------
gulp.task('watch-haml', ['haml'], function() {
	browserSync.reload(); // recommended method only works once: gulp.task('watch-haml', ['haml'], browserSync.reload);
});


// Copy (if changed) all of our vendor scripts to build/assets/js
// ----------------------------------------------------------------------------
gulp.task('vendor', function() {

	return gulp.src(paths.scripts.vndr)
		.pipe(plugins.changed(paths.scripts.dest))
		.pipe(gulp.dest(paths.scripts.dest));

});


// Copy (if changed) all of our fonts to build/assets/fonts
// ----------------------------------------------------------------------------
gulp.task('fonts', function() {

	return gulp.src(paths.fonts.src)
		.pipe(plugins.changed(paths.fonts.dest))
		.pipe(gulp.dest(paths.fonts.dest));

});


// Copy (if changed) all of our audio to build/assets/aud
// ----------------------------------------------------------------------------
gulp.task('audio', function() {

	return gulp.src(paths.audio.src)
		.pipe(plugins.changed(paths.audio.dest))
		.pipe(gulp.dest(paths.audio.dest));

});


// Copy (if changed) all of our videos to build/assets/vid
// ----------------------------------------------------------------------------
gulp.task('videos', function() {

	return gulp.src(paths.videos.src)
		.pipe(plugins.changed(paths.videos.dest))
		.pipe(gulp.dest(paths.videos.dest));

});


// Copy (if changed) all of our miscellaneous files to the build folder
// ----------------------------------------------------------------------------
gulp.task('misc', ['vendor', 'fonts', 'audio', 'videos'], function() {

	return gulp.src([paths.misc.root + '*', paths.misc.root + '.htaccess'])
		.pipe(plugins.changed(paths.misc.dest))
		.pipe(gulp.dest(paths.misc.dest));

});


/*
// Use rsync to deploy to server
// ----------------------------------------------------------------------------
gulp.task('deploy', function() {

	gulp.src('build/')
		.pipe(plugins.rsync({
			root: 'build',
			hostname: secrets.server.host,
			destination: secrets.server.dest,
			incremental: true,
			progress: true,
			recursive: true,
			clean: true,
			exclude: ['.DS_Store']
		}));

});
*/


// Spin up a Browser Sync server in our build folder and watch dev files
// ----------------------------------------------------------------------------
gulp.task('watch', function() {

	// consider setting up a 2nd server without ghostMode for internal review...
	// that way everyone can review the site individually without mirrored behaviour
	browserSync.init({
		open: false,
		server: 'build',
		ghostMode: {
			clicks: true,
			forms: true,
			scroll: true
		}
	});

	// inject updated styles into browser
	gulp.watch(paths.styles.src + '*.scss', ['styles']);

	// reload browser on .html changes (multiple files, so wait until all have been compiled)
	gulp.watch(paths.haml.src + '**/*.haml', ['watch-haml']);

	// reload browser on .js changes (only one file, so this approach is fine)
	gulp.watch(paths.scripts.src, ['scripts']);
	gulp.watch(paths.scripts.dest + '*.js').on('change', browserSync.reload);

});


// Default gulp task
// ----------------------------------------------------------------------------
gulp.task('default', function() {
	sequence('clean', 'svg', ['styles', 'scripts', 'misc', 'haml'], 'watch'); // removed 'images' task as it takes LONG
});