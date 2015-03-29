// FOUNDATION FOR APPS TEMPLATE GULPFILE
// -------------------------------------
// This file processes all of the assets in the "client" folder, combines them with the Foundation for Apps assets, and outputs the finished files in the "build" folder as a finished app.

// 1. LIBRARIES
// - - - - - - - - - - - - - - -

var gulp     = require('gulp'),
$        = require('gulp-load-plugins')(),
rimraf   = require('rimraf'),
sequence = require('run-sequence'),
package  = require('./package.json');

// 2. FILE PATHS
// - - - - - - - - - - - - - - -

// Output directory for this build. Can be output to anywhere in the file
//  system i.e. Wordpress themes directory
//var buildDir = './build';
var buildDir = '/var/www/garethcooper.com/wp-content/themes/wp-base-theme';

var paths = {
  assets: [
    './src/**/*.*',
    '!./src/{scss,javascripts}/**/*.*'
  ],
  // Sass will check these folders for files when you use @import.
  sass: [
    'src/scss',
    'bower_components/foundation/scss/'
  ],
  vendorJS: [
    'bower_components/foundation/js/vender/modernizr.js',
    'bower_components/foundation/js/foundation.js'
  ],
  // These files are for your app's JavaScript
  appJS: [
    'src/javascripts/**/*.js'
  ]
}

// 3. TASKS
// - - - - - - - - - - - - - - -

// Cleans the build directory
gulp.task('clean', function(cb) {
  rimraf(buildDir, cb);
});

// Copies everything in the client folder except templates, Sass, and JS
gulp.task('copy', function() {
  return gulp.src(paths.assets, {
    base: './src/'
  })
  .pipe(gulp.dest(buildDir))
  ;
});

// Compile SASS
gulp.task('sass', function() {
  return gulp.src('./src/scss/style.scss')
  .pipe($.sass({
    includePaths: paths.sass,
    style: 'nested',
    errLogToConsole: true
  }))
  .pipe($.replace('@@version', package.version))
  .pipe($.autoprefixer({
    browsers: ['last 2 versions', 'ie 10']
  }))
  .pipe(gulp.dest(buildDir));
});

gulp.task('lint', function() {
  return gulp.src('./src/javascripts/*.js')
  .pipe($.jshint())
  .pipe($.jshint.reporter('jshint-stylish'));
});

// Compiles and copies the Foundation for Apps JavaScript, as well as your app's custom JS
gulp.task('uglify', ['lint'], function(cb) {
  // Foundation JavaScript
  gulp.src(paths.vendorJS)
  //.pipe($.plumber())
  .pipe($.uglify())
  .pipe($.concat('vendor.js'))
  .pipe(gulp.dest(buildDir + '/js/'))
  ;

  // App JavaScript
  gulp.src(paths.appJS)
  .pipe($.plumber({ //hide errors as lint will deal with them in a much more friendly way
    errorHandler: function (err) {
      //console.log(err);
      this.emit('end');
    }
  }))
  .pipe($.uglify())
  .pipe($.concat('app.js'))
  .pipe(gulp.dest(buildDir + '/js/'))
  ;

  cb();
});

// Builds your entire app once, without starting a server
gulp.task('build', function(cb) {
  sequence('clean', ['copy', 'sass', 'uglify'], function() {
    console.log("Successfully built.");
    cb();
  });
});

// Default task: builds your app, starts a server, and recompiles assets when they change
gulp.task('default', function () {
  // Run the server after the build
  sequence('build');

  // Watch Sass
  gulp.watch(['./src/scss/**/*'], ['sass']);

  // Watch JavaScript
  gulp.watch(['./src/javascripts/**/*'], ['uglify']);

  // Watch static files
  gulp.watch(paths.assets, ['copy']);

});
