'use strict';

var gulp = require('gulp');
var shell = require('gulp-shell');
var connect = require('gulp-connect');


gulp.task('open_port', function() {
    var serverPort = 8080;
    var localhost = 'http://localhost:' + serverPort;

    connect.server({
        host: 'localhost',
        port: serverPort,
        livereload: false,
        root: './'
    });
});

gulp.task('default', ['open_port']);
