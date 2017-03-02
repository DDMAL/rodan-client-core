'use strict';

////////////////////////////////////////////////////////////////////////////////
// REQUIRE
////////////////////////////////////////////////////////////////////////////////
const del = require('del');
const fs = require('fs');
const gulp = require('gulp');
const ip = require('ip');
const path = require('path');
const symlink = require('gulp-sym');
const webpack = require('webpack');
const WebpackDevServer = require("webpack-dev-server");

////////////////////////////////////////////////////////////////////////////////
// CONFIGURATION - test
////////////////////////////////////////////////////////////////////////////////
const TEST_HOST = ip.address();
const TEST_PORT = 9002;
const TEST_DIRECTORY = 'test';

////////////////////////////////////////////////////////////////////////////////
// CONFIGURATION - build
// NOTE: don't edit this unless you know what you're doing.
////////////////////////////////////////////////////////////////////////////////
const BUILD_ROOT = 'dist';
const ENTRY_FILE = './src/index.js';
const LIBRARY_NAME = 'rodan-client-core';
const LIBRARY_NAME_VAR = 'rodan_client_core';
const LIBRARY_TARGET = 'umd';
const NODE_MODULES_DIRECTORY = 'node_modules';
const OUTPUT_FILE = 'rodan-client-core.js';
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
        libraryTarget: LIBRARY_TARGET,
        path: path.resolve(__dirname, BUILD_ROOT)
    },
    module: 
    {
        rules: [{
            exclude: /(node_modules)/,
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
 * Links test results to web directory.
 */
gulp.task('test:link', function()
{
    return gulp.src([NODE_MODULES_DIRECTORY + '/mocha',
                     NODE_MODULES_DIRECTORY + '/chai'])
               .pipe(symlink([TEST_DIRECTORY + '/libs/mocha',
                              TEST_DIRECTORY + '/libs/chai'], {force: true}));
});

/**
 * Bundle (Webpack) and start the test server.
 */
gulp.task('test', ['test:link'], function(callback)
{
    webpackConfig.output.library = LIBRARY_NAME_VAR;
    webpackConfig.output.libraryTarget = 'var';
    var compiler = webpack(webpackConfig);
    var server = new WebpackDevServer(compiler, { contentBase: TEST_DIRECTORY });
    server.listen(TEST_PORT, TEST_HOST, function(err)
    {
        var domainPort = TEST_HOST + ':' + TEST_PORT;
        var url = 'http://' + domainPort;
        console.log('');
        console.log('================================================================================');
        console.log('Starting server on ' + domainPort);
        console.log('Serving: ' + TEST_DIRECTORY);
        console.log('');
        console.log('Open your browser to ' + url + '.');
        console.log('(Make sure ' + domainPort + ' is allowed access to the Rodan server.)');
        console.log('================================================================================');
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
    callback();
});
