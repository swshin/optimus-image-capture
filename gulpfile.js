var gulp = require('gulp');
var uglify = require('gulp-uglify');
var minifycss = require('gulp-minify-css');
var rename = require('gulp-rename');

//자바스크립트 파일을 압축한다.
gulp.task('optimize-js', function () {
	return gulp.src(['phantom/inline.js'])
		.pipe(uglify())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('phantom'));
});

//CSS 파일을 압축한다.
gulp.task('optimize-css', function () {
	return gulp.src(['phantom/inline.css'])
		.pipe(minifycss())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('phantom'));
});

//기본 task 설정
gulp.task('default', ['optimize-js', 'optimize-css']);
