'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var path = require('path');
var browserSync = require('browser-sync');
var del = require('del');
var runSequence = require('run-sequence');

var dir = {
    dev : 'dev',
    dist : 'dist',
    assets : 'assets',
    projectRoot : ''
};

// server
gulp.task('server', function () {
    browserSync({
        server: {
            baseDir: dir.dev
        }
    });
});

// watch
gulp.task('watch', function () {
    gulp.watch([path.join(dir.dev, '**/*.html')], ['html']);
    gulp.watch([path.join(dir.dev, dir.projectRoot, dir.assets, '_sass/*.scss')], ['sass']);
    gulp.watch([path.join(dir.dev, dir.projectRoot, dir.assets, 'js/plugins/*')], ['concat']);
    gulp.watch([path.join(dir.dev, dir.projectRoot, dir.assets, 'js/*.js')], ['jshint']);
    gulp.watch([path.join(dir.dev, dir.projectRoot, dir.assets, 'images/**/*')], ['images']);
});

// sass
gulp.task('sass', function () {
    gulp.src(path.join(dir.dev, dir.projectRoot, dir.assets, '_sass/*.scss'))
        .pipe($.plumber())
        .pipe($.sass())
        .pipe($.autoprefixer({browsers: ['last 3 version', 'ie 7']}))
        .pipe(gulp.dest(path.join(dir.dev, dir.projectRoot, dir.assets, 'css')))
        .pipe(browserSync.reload({stream:true}));
});

// jshint
gulp.task('jshint', function () {
    return gulp.src(path.join(dir.dev, dir.projectRoot, dir.assets, 'js/*.js'))
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe(browserSync.reload({stream:true}));
});

// htmlhint
gulp.task('html', function () {
    return gulp.src(path.join(dir.dev, '**/*.html'))
        .pipe($.htmlhint())
        .pipe($.htmlhint.reporter())
        .pipe(browserSync.reload({stream:true}));
});

// images
gulp.task('images', function () {
    return gulp.src(path.join(dir.dev, dir.projectRoot, dir.assets, 'images/**/*'))
        .pipe($.imagemin())
        .pipe(gulp.dest(path.join(dir.dev, dir.projectRoot, dir.assets, 'images')))
        .pipe(browserSync.reload({stream:true}));
});

// js plugins
gulp.task('concat', function () {
    return gulp.src([path.join(dir.dev, dir.projectRoot, dir.assets, 'js/plugins/*.js')])
        .pipe($.concat('plugins.js'))
        .pipe(gulp.dest(path.join(dir.dev, dir.projectRoot, dir.assets, 'js/lib')));
});

// uglify
gulp.task('uglify', function () {
    return gulp.src(path.join(dir.dev, dir.projectRoot, dir.assets, 'js/*.js'))
        .pipe($.uglify({preserveComments: 'some'}))
        .pipe(gulp.dest(path.join(dir.dist, dir.projectRoot, dir.assets, 'js')));
});

// clean
gulp.task('clean:all', function () {
    return del([dir.dist]);
});
gulp.task('clean:dist', function () {
    return del([
        path.join(dir.dist, dir.projectRoot, dir.assets, 'js/plugins'),
        path.join(dir.dist, dir.projectRoot, dir.assets, '_sass')
    ]);
});

//copy
gulp.task('copy', function () {
    return gulp.src(path.join(dir.dev, '**/*'))
        .pipe(gulp.dest(dir.dist));
});

gulp.task('default', ['server', 'watch']);

gulp.task('build', function () {
    return runSequence(
        'clean:all',
        ['sass', 'images', 'concat'],
        'copy',
        'clean:dist',
        'uglify'
    );
});

