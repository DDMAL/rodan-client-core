'use strict';

////////////////////////////////////////////////////////////////////////////////
// REQUIRE
////////////////////////////////////////////////////////////////////////////////
const del = require('del');
const fs = require('fs');
const gulp = require('gulp');
const path = require('path');
const symlink = require('gulp-sym');
const webpack = require('webpack');
const WebpackDevServer = require("webpack-dev-server");

////////////////////////////////////////////////////////////////////////////////
// CONFIGURATION - test
////////////////////////////////////////////////////////////////////////////////
const TEST_HOST = '132.206.14.112';
const TEST_PORT = 9002;
const TEST_WEBROOT = '__test__';
const TEST_DIRECTORY = 'test';

////////////////////////////////////////////////////////////////////////////////
// CONFIGURATION - build
// NOTE: don't edit this unless you know what you're doing.
////////////////////////////////////////////////////////////////////////////////
const BUILD_ROOT = 'build';
const CONFIGURATION_FILE = 'configuration.json';
const CONFIGURATION_EXAMPLE_FILE = 'configuration.example.json';
const ENTRY_FILE = './src/index.js';
const INFO_FILE = 'info.json';
const LIBRARY_NAME = 'rodan_client_core';
const LIBRARY_TARGET = 'commonjs';
const NODE_MODULES_DIRECTORY = 'node_modules';
const OUTPUT_FILE = 'rodan_client_core.js';
const PACKAGE_FILE = 'package.json';

////////////////////////////////////////////////////////////////////////////////
// WEBPACK
////////////////////////////////////////////////////////////////////////////////
var webpackConfig = 
{
    entry: ENTRY_FILE,
    output: 
    {
        filename: OUTPUT_FILE,
        library: LIBRARY_NAME,
        path: path.resolve(__dirname, BUILD_ROOT)
    },
    module: 
    {
        rules: [{
            exclude: /(node_modules|bower_components)/,
            test: /\.(js)$/,
            use: [{loader: 'babel-loader', options: {presets: ['es2015']}}]
        }]
    },
    resolve:
    {
        modules: [
            path.resolve(__dirname + '/src'),
            path.resolve(__dirname + '/node_modules')
        ]
    },
    target: 'web'
};

////////////////////////////////////////////////////////////////////////////////
// TASKS - build
////////////////////////////////////////////////////////////////////////////////
/**
 * Cleans out build.
 */
gulp.task('build:clean', function()
{
    return del([BUILD_ROOT]);
});

/**
 * Make web directory.
 */
gulp.task('build:mkdir', ['build:clean'], function(callback)
{
    return fs.mkdir(BUILD_ROOT, callback);
});

/**
 * Bundle (Webpack) and start the development server.
 */
gulp.task('build', ['build:mkdir'], function(callback)
{
    webpackConfig.output.libraryTarget = LIBRARY_TARGET;
    webpack(webpackConfig, function(error, data)
    {
        if (error)
        {
            callback(error);
        }
        const info = data.toJson();
        if (data.hasErrors()) 
        {
            console.error(info.errors);
        }
        if (data.hasWarnings()) 
        {
            console.warn(info.warnings)
        }
        callback();
    });
});

////////////////////////////////////////////////////////////////////////////////
// TASKS - test
////////////////////////////////////////////////////////////////////////////////
/**
 * Cleans out test.
 */
gulp.task('test:clean', function()
{
    return del([TEST_WEBROOT]);
});

/**
 * Make web directory.
 */
gulp.task('test:mkdir', ['test:clean'], function(callback)
{
    return fs.mkdir(TEST_WEBROOT, callback);
});

/**
 * Creates info.json. This holds client data, such as version. It's basically
 * a trimmed 'package.json'.
 */
gulp.task('test:info', ['test:mkdir'], function(callback)
{
    var info = createInfo(function(err, data)
    {
        fs.writeFileSync(TEST_WEBROOT + '/' + INFO_FILE, JSON.stringify(data, null, 4));
        callback();
    });
});

/**
 * Links test results to web directory.
 */
gulp.task('test:link', ['test:mkdir'], function()
{
    return gulp.src([TEST_DIRECTORY + '/index.html', 
                     TEST_DIRECTORY + '/test.js'])
               .pipe(symlink([TEST_WEBROOT + '/index.html',
                              TEST_WEBROOT + '/test.js'], {force: true}));
});

/**
 * Bundle (Webpack) and start the test server.
 */
gulp.task('test', ['test:mkdir', 'test:link', 'test:info'], function(callback)
{
    var compiler = webpack(webpackConfig);
    var server = new WebpackDevServer(compiler, { contentBase: TEST_WEBROOT });
    server.listen(TEST_PORT, TEST_HOST, function(err)
    {
        console.log('');
        console.log('==========');
        console.log('Starting server on: http://' + TEST_HOST + ':' + TEST_PORT);
        console.log('Serving: ' + TEST_WEBROOT);
        console.log('');
        console.log('Make sure ' + TEST_HOST + ':' + TEST_PORT + ' is allowed access to the Rodan server');
        console.log('==========');
        console.log('');
    });
});

////////////////////////////////////////////////////////////////////////////////
// TASKS - Master
////////////////////////////////////////////////////////////////////////////////
/**
 * Default task (test).
 */
gulp.task('default', function(callback)
{
    gulp.start('test');
    callback();
});

/**
 * Clean everything.
 */
gulp.task('clean', function(callback)
{
    gulp.start('build:clean');
    gulp.start('test:clean');
    callback();
});

////////////////////////////////////////////////////////////////////////////////
// UTILITIES
////////////////////////////////////////////////////////////////////////////////
/**
 * Creates data for info.json.
 */
function createInfo(callback)
{
    var json = require('./' + PACKAGE_FILE);
    var info = {CLIENT: json};
    callback(null, info);
}