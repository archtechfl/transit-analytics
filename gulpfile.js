'use strict';

var gulp = require('gulp');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');

var DEST = 'build/';

gulp.task('minify-scripts', function() {
  return gulp.src('scripts/*.js')
    // This will minify and rename to foo.min.js
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest(DEST + "js"));
});

gulp.task('minify-css', function() {
  return gulp.src('static/css/*.css')
    .pipe(minifyCss())
    .pipe(gulp.dest(DEST + "css"))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest(DEST + "css"));
});

gulp.task('watch-scripts', function () {
   gulp.watch('scripts/*.js', ['minify-scripts']);
});

gulp.task('watch-css', function () {
   gulp.watch('static/css/*.css', ['minify-css']);
});

gulp.task('default', ['minify-scripts','minify-css','watch-scripts','watch-css'],
    function () {
});

