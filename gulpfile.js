var gulp = require('gulp');
var browserify = require('browserify');
var babelify = require('babelify');
var streamify = require('gulp-streamify');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var source = require('vinyl-source-stream');

var PLUGIN_NAME = 'google-heat-tiles';

gulp.task('build', function() {
  browserify(['./index.js'])
  .transform(babelify)
  .bundle()
  .pipe(source(PLUGIN_NAME + '.js'))
  .pipe(gulp.dest('dist'))
  .pipe(streamify(uglify()))
  .pipe(rename(PLUGIN_NAME + '.min.js'))
  .pipe(gulp.dest('dist'));
});

gulp.task('default', ['build']);
