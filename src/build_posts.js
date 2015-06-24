/* jshint node: true */
module.exports = function (grunt, callback) {
    'use strict';
    var fs = require('fs');
    var async = require('async');
    var path = require('path');
    var rimraf = require('rimraf');
    var swig = require('swig');
    var ncp = require('ncp').ncp;
    var moment = require('moment');
    var _ = require('lodash');
    var exec = require('child_process').exec;

    var gather_metadata = require('./gather_metadata');



    var site = grunt.config.get('nog');
    var metadata = gather_metadata(grunt);
    var files;

    var stdout_or_err = function(stdout, stderr){
        if (stderr){
            grunt.log.error(stderr);
        } else {
            if (stdout){
                grunt.log.ok(stderr);
            }

        }
    }


    async.series(
        [
            // Make sure we're on master...
            function(callback){
                exec(
                    'git checkout master',
                    function (error, stdout) {
                        callback(error)
                    }
                );
            },


            //read the old...
            function(callback){
                fs.readdir(process.cwd(), function(err, result){
                    files = result;
                    callback(err);
                });
            },

            //delete the old...
            function(callback){
                var keep = ['_nog', 'node_modules', 'README.md', 'package.json', 'LICENSE', 'Gruntfile.js'];
                async.each(files, function(name, callback){
                    if (_.indexOf(keep, name) !== -1) return callback(null);
                    if (name.indexOf('.') === 0) return callback(null);
                    rimraf(path.join(process.cwd(), name), callback);
                }, callback)
            },

            //write the atomic URLs
            function(callback){
                async.each(metadata.atomic_metadata, function(meta, callback){
                    var template;
                    var data = {
                        post: meta,
                        current_post: meta,
                        site: site,
                        posts: metadata.atomic_metadata,
                        archives: metadata.archives,
                        tag_archives: metadata.tag_archives
                    };
                    if (meta.post_type === 'post'){
                        template = _.has(site, 'post_template') ? site.post_template : 'post.twig';

                    } else {
                        template = _.has(site, 'page_template') ? site.page_template : 'page.twig';
                    }
                    template = _.has(meta, 'template') ? meta.template : template;
                    template = path.join(process.cwd(), '_nog', 'templates', template);
                    swig.renderFile(template, data, function (err, output) {
                        var p = path.join(process.cwd(), meta.relative_url, 'index.html');
                        if (err) return callback(err);
                        grunt.file.write(p, output);
                        callback();
                    });
                }, callback);
            },

            //write the archive URLs
            function(callback){
                async.each([].concat(_.values(metadata.archives), _.values(metadata.tag_archives)), function(archive, callback){
                    console.log('write archive', archive.pages);
                    async.each(archive.pages, function(page, callback){
                        var template;
                        var data = {
                            post: null,
                            current_post: null,
                            site: site,
                            posts: metadata.atomic_metadata,
                            archives: metadata.archives,
                            tag_archives: metadata.tag_archives,
                            archive: archive,
                            page: page
                        };

                        template = _.has(site, 'archive_template') ? site.archive_template : 'archive.twig';
                        template = _.has(archive, 'template') ? archive.template : template;
                        template = path.join(process.cwd(), '_nog', 'templates', template);
                        swig.renderFile(template, data, function (err, output) {
                            var p = path.join(process.cwd(), page.relative_url, 'index.html');
                            if (err) return callback(err);
                            grunt.file.write(p, output);
                            callback();
                        });
                    }, callback);

                }, callback);
            },

            //write the assets
            function(callback){
                var src = path.join(process.cwd(), '_nog', 'assets' );
                var dst = path.join(process.cwd(), 'assets' );
                ncp(src, dst, callback);
            },
            function(callback){
                var p = path.join(process.cwd(), 'search.json');
                fs.writeFile(p, JSON.stringify(metadata.search), callback);
            },

            //// git add -A ...
            //function(callback){
            //    exec(
            //        'git add -A',
            //        function (error, stdout, stderr) {
            //            callback(error)
            //        }
            //    );
            //},
            //
            //// git commit -A ...
            //function(callback){
            //    exec(
            //        'git commit -m "nog build on ' + moment().toISOString() + '"',
            //        function (error, stdout, stderr) {
            //            stdout_or_err(stdout, stderr)
            //            callback(error)
            //        }
            //    );
            //},
            //// checkout gh-pages...
            //function(callback){
            //    exec(
            //        'git checkout gh-pages',
            //        function (error, stdout) {
            //            callback(error)
            //        }
            //    );
            //},
            //
            //// merge master into gh-pages...
            //function(callback){
            //    exec(
            //        'git merge master',
            //        function (error, stdout) {
            //            callback(error)
            //        }
            //    );
            //},
            //
            //// checkout master...
            //function(callback){
            //    exec(
            //        'git checkout master',
            //        function (error, stdout) {
            //            callback(error)
            //        }
            //    );
            //}

        ], function(err){
            console.log('Error:', err);
            callback();
        }
    );







};


