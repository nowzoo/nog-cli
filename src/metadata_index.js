/* jshint node: true */
module.exports = function (program, options, callback) {
    'use strict';
    var async = require('async');
    var fs = require('fs');
    var path = require('path');
    var _ = require('lodash');
    var colors = require('colors/safe');




    var read_content = require('./read_content');

    var file_list;
    var index;



    if (program.verbose) console.log(colors.gray.bold('Gathering metadata for the home page...'));

    async.series(
        [
            // Read the content/posts directory
            function(callback){
                var p = path.join(process.cwd(), 'content', 'index');
                if (program.verbose) console.log(colors.cyan('Reading the content/index directory...'));
                fs.readdir(p, function(err, result){
                    file_list = result;
                    callback(err);
                });
            },

            // Create the posts...
            function(callback){
                var filename = null;
                if (_.indexOf(file_list, 'index.md') !== -1){
                    filename = 'index.md';
                } else {
                    if (_.indexOf(file_list, 'index.html') !== -1){
                        filename = 'index.html';
                    }
                }
                if (filename){
                    read_content(program, 'index', filename, 'index', function(err, post){
                        if (! err && post){
                            index = post;
                        }
                        callback(err);
                    });
                } else {
                    callback('No home page content found in the content/index directory.')
                }

            },

            //get the path...
            function (callback) {
                index.path = '';
                callback(null);
            }
        ],
        function(err){
            callback(err, {
                index: index
            });
        }
    );




};


