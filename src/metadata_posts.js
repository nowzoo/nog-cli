/* jshint node: true */
module.exports = function (program, options, callback) {
    'use strict';
    var async = require('async');
    var fs = require('fs');
    var path = require('path');
    var _ = require('lodash');
    var colors = require('colors/safe');


    var metadata_post_archives = require('./metadata_post_archives');


    var read_content = require('./read_content');

    var file_list;
    var archives;
    var posts = {};

    var posts_path = path.join(process.cwd(), 'content', 'posts');

    if (program.verbose) console.log(colors.gray.bold('Gathering metadata for posts...'));

    async.series(
        [
            // Read the content/posts directory
            function(callback){
                if (program.verbose) console.log(colors.cyan('Reading the content/posts directory...'));
                fs.readdir(posts_path, function(err, result){
                    file_list = result;
                    callback(err);
                });
            },

            // Create the posts...
            function(callback){
                async.each(file_list, function(filename, callback){
                    var p = path.join(posts_path, filename);
                    read_content(program, p, 'post', function(err, post){
                        if (! err && post){
                            posts[post.id] = post;
                        }
                        callback(err);
                    })

                }, callback)
            },

            function (callback) {
                metadata_post_archives(program, options, posts, function(err, result){
                    archives = result;
                    callback(err);
                })
            },
            //get the path...
            function (callback) {
                _.each(posts, function(post, id){
                    if (program.verbose) console.log(colors.cyan('Normalizing the path for %s...'), id);
                    post.path = options.atomic_path(post, id);
                });
                callback(null);
            }
        ],
        function(err){
            callback(err, {
                posts: posts,
                archives: archives
            });
        }
    );




};


