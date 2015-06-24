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
    var pages = {};



    if (program.verbose) console.log(colors.gray.bold('Gathering metadata for pages...'));



    async.series(
        [

            // Read the content/posts directory
            function(callback){
                var p = path.join(process.cwd(), 'content', 'pages');
                if (program.verbose) console.log(colors.cyan('Reading the content/pages directory...'));
                fs.readdir(p, function(err, result){
                    file_list = result;
                    callback(err);
                });
            },

            // Create the posts...
            function(callback){
                async.each(file_list, function(filename, callback){
                    read_content(program, 'pages', filename, 'page', function(err, page){
                        if (! err && page){
                            pages[page.id] = page;
                        }
                        callback(err);
                    })

                }, callback);
            },

            //get the parents of each page...
            function (callback) {


                _.each(pages, function(page, id){
                    if (program.verbose) console.log(colors.cyan('Normalizing the page parent for %s...'), id);
                    var parent_id = page.parent || null;
                    var parent = _.has(pages, parent_id) ? pages[parent_id] : null;
                    var parents = [];
                    if (parent_id && ! parent){
                        page.has_error = true;
                        page.errors.push('Invalid parent page. Could not find a page with the id ' + parent_id + '.');
                        page.parent = null;
                    }
                    while(parent){
                        parents.unshift(parent);
                        parent = parent.parent && _.has(pages, parent.parent) ? pages[parent.parent] : null;
                    }
                    page.parents = parents;
                });
                callback(null);
            },

            //get the children of each page...
            function (callback) {

                _.each(pages, function(page, id){
                    if (program.verbose) console.log(colors.cyan('Normalizing the page children for %s...'), id);
                    var children = [];
                    _.each(pages, function(child){
                        if (child.parent && child.parent === id){
                            children.push(child);
                        }
                    });
                    page.children = children;
                });

                callback(null);
            },

            //get the path...
            function (callback) {
                _.each(pages, function(page, id){
                    if (program.verbose) console.log(colors.cyan('Normalizing the path for %s...'), id);
                    page.path = options.atomic_path(page);
                });
                callback(null);
            }
        ],
        function(err){
            callback(err, {
                pages: pages
            });
        }
    );




};


