var gulp = require('gulp');
var uglify = require('gulp-uglify');
var minifycss = require('gulp-minify-css');
var rename = require('gulp-rename');

//자바스크립트 파일을 압축한다.
gulp.task('optimize-js', function () {
	return gulp.src(['phantom/resources/inline.js'])
		.pipe(uglify())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('phantom/resources'));
});

//CSS 파일을 압축한다.
gulp.task('optimize-css', function () {
	return gulp.src(['phantom/resources/inline.css'])
		.pipe(minifycss())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('phantom/resources'));
});

//기본 task 설정
gulp.task('default', ['optimize-js', 'optimize-css']);
