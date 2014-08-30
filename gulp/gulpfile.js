// npm install gulp gulp-if gulp-uglify gulp-util gulp-ruby-sass gulp-concat gulp-plumber gulp-browserify gulp-minify-html gulp-imagemin imagemin-pngcrush gulp-changed gulp-newer gulp-cache gulp-open gulp-file-include gulp-notify --save-dev

var gulp = require('gulp'),
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),
    gutil = require('gulp-util'),
    sass = require('gulp-ruby-sass'),
    concat = require('gulp-concat'),
    plumber = require('gulp-plumber'),
    browserify = require('gulp-browserify'),
    minifyHTML = require('gulp-minify-html'),
    imagemin = require('gulp-imagemin'),
    pngcrush = require('imagemin-pngcrush'),
    // changed = require('gulp-changed'),
    newer = require('gulp-newer'),
    // cache = require('gulp-cache'),
    open = require("gulp-open"),
    fileinclude = require('gulp-file-include'),
    notify = require('gulp-notify');
 
var browserSync = require('browser-sync');
var env,
    jsSources,
    htmlSources,
    sassSources,
    outputDir;
 
env = process.env.NODE_ENV || 'development';
 
if (env === 'development'){
  outputDir = 'builds/development/';
  sassStyle = 'expanded';
} else {
  outputDir = 'builds/production/';
  sassStyle = 'compressed';
}
 
 
jsSources = ['components/js/*.js'];
htmlSources = [outputDir + '*.html'];
sassSources = ['components/scss/**/*.scss'];
 
gulp.task('fileinclude', function() {
    // content
    gulp.src('components/index.html')
    .pipe(fileinclude())
    .pipe(gulp.dest('builds/development/'))
    .pipe( notify({ message: "fileInclude tasks have been completed!"}) );
 
});
gulp.task('html', function() {
    gulp.src('builds/development/*.html')
    .pipe(gulpif(env === 'production', minifyHTML()))
    .pipe(gulpif(env === 'production', gulp.dest(outputDir)))
    .pipe( notify({ message: "HTML tasks have been completed!"}) );
});
 
// URL task
gulp.task('url', function() {
    var options = {
        url: "http://localhost:3000",
    app: "google-chrome"
    };
    gulp.src('builds/development/index.html')
      .pipe(open("", {app: "google-chrome", url: "http://localhost:3000"}))
      .pipe(plumber());
});
 
// browserSync task
gulp.task('browser-sync', function() {
    browserSync( ['builds/development/*.html','builds/development/css/*.css','builds/development/js/*.js' ],{
        server: {
            baseDir: "builds/development/"
        }
    });
});
 
//image task
gulp.task('images', function() {
    gulp.src('builds/development/images/**/*.*')
      .pipe(newer(outputDir + 'images'))
      .pipe(gulpif(env === 'production', imagemin({
        optimizationLevel: 7,
        interlaced: true,
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        use:[pngcrush()]
      })))
      .pipe(gulpif(env === 'production', gulp.dest(outputDir + 'images')))
      .pipe(plumber())
      .pipe( notify({ message: "Images tasks have been completed!"}) );
 
});
 
//sass task
gulp.task('sass', function() {
    gulp.src(sassSources)
      .pipe(sass({
        style: sassStyle
      }))
      .pipe(gulp.dest(outputDir + 'css'))
      .pipe(plumber())
      .pipe( notify({ message: "Sass tasks have been completed!"}) );
});
 
// scripts task
// uglifies
gulp.task('scripts', function() {
   gulp.src(jsSources)
      .pipe(concat('script.js'))
      .pipe(browserify())
      .pipe(gulpif(env === 'production', uglify()))
      .pipe(gulp.dest(outputDir +'js') )
      .pipe(plumber())
      .pipe( notify({ message: "Scripts tasks have been completed!"}) );
});
 
//watch task 
gulp.task('watch', function() {
    gulp.watch('builds/development/*.html', ['html']);
    gulp.watch('components/*.html', ['url']);
    gulp.watch('components/index.html', ['fileinclude']);
    gulp.watch('builds/development/images/**/*.*', ['images']);
    gulp.watch(sassSources, ['sass']);
    gulp.watch(jsSources, ['scripts']);
 
});
 
 
gulp.task('default', ['fileinclude', 'html','sass',  'scripts', 'images', 'url', 'browser-sync', 'watch']  );