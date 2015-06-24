/* jshint node: true */
module.exports = function (program, callback) {
    'use strict';
    var async = require('async');
    var _ = require('lodash');
    var colors = require('colors/safe');



    var metadata_index = require('./metadata_index');
    var metadata_pages = require('./metadata_pages');
    var metadata_posts = require('./metadata_posts');
    var metadata_search = require('./metadata_search');
    var get_options = require('./get_options');


    var options;

    var data = {
        index: null,
        pages: null,
        posts: null,
        archives: null,
        search: null
    };

    if (program.verbose) console.log(colors.black.bold('Gathering metadata...'));

    async.series(
        [
            function(callback){
                get_options(program, function(err, result){
                    options = result;
                    callback(err);
                });
            },

            function(callback){
                metadata_index(program, options, function(err, result){
                    data.index = result.index;
                    callback(err);
                });
            },

            function(callback){
                metadata_pages(program, options, function(err, result){
                    data.pages = result.pages;
                    callback(err);
                });
            },

            function(callback){
                metadata_posts(program, options, function(err, result){
                    data.posts = result.posts;
                    data.archives = result.archives;
                    callback(err);
                });
            },
            function(callback){
                var content = [].concat(_.values(data.posts), _.values(data.pages), [data.index]);
                metadata_search(content, function(err, result){
                    data.search = result;
                    callback(err);
                });
            }
        ],
        function(err){

            callback(err, data);
        }
    );

};


