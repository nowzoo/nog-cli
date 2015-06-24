/* jshint node: true */
module.exports = function (program, metadata, callback) {
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
    var grunt = require('grunt');

    var gather_metadata = require('./gather_metadata');


    async.series(
        [
            // Make sure we're on master...
            function(callback){
                exec(
                    'git checkout master',
                    function (error) {
                        callback(error)
                    }
                );
            },


            //delete the old _site...
            function(callback){
                var p = path.join(process.cwd(), '_site');
                rimraf(p, callback);
            },
            

            //write the atomic content...
            function(callback){
                var content = [].concat(metadata.index, _.values(metadata.posts), _.values(metadata.pages))

                async.each(content, function(post, callback){
                    var template = path.join(process.cwd(), 'templates', post.type + '.twig');
                    var data = {
                        data: metadata,
                        post: post
                    };
                    swig.renderFile(template, data, function (err, output) {
                        var p = path.join(process.cwd(), '_site', post.path, 'index.html');
                        if (err) return callback(err);
                        grunt.file.write(p, output);
                        callback();
                    });
                }, callback);
            },


            //write the archives
            function(callback){
                var template = path.join(process.cwd(), 'templates', 'archive.twig');
                var archives = [].concat(
                    metadata.archives.main,
                    _.values(metadata.archives.tags),
                    _.values(metadata.archives.date)
                );
                async.each(archives, function(archive, callback){
                    async.each(archive.pages, function(page, callback){
                        var data = {
                            data: metadata,
                            archive: archive,
                            page: page
                        };
                        swig.renderFile(template, data, function (err, output) {
                            var p = path.join(process.cwd(), '_site', page.path,  'index.html');
                            if (err) return callback(err);
                            grunt.file.write(p, output);
                            callback();
                        });
                    }, callback);
                }, callback);
            },


            //write the assets
            function(callback){
                var src = path.join(process.cwd(), 'assets' );
                var dst = path.join(process.cwd(), '_site', 'assets' );
                ncp(src, dst, callback);
            },
            function(callback){
                var p = path.join(process.cwd(), '_site', 'search.json');
                grunt.file.write(p, JSON.stringify(metadata.search));
                callback();
            }



        ], function(err){
            console.log('Error:', err);
            callback();
        }
    );







};


