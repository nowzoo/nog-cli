/* jshint node: true */
module.exports = function (program, callback) {
    'use strict';
    var async = require('async');
    var fs = require('fs');
    var path = require('path');
    var _ = require('lodash');
    var colors = require('colors/safe');





    var options = {};

    var defaults = {
        title: 'Nog',
        tagline: 'A simple site generator for GitHub Pages.',
        site_url: '',
        site_prefix: '/nog',
        posts_per_page: 10,
        atomic_path: function (post, id) {
            var slugs;
            var type = post.type;
            if (type === 'post') {
                return path.join('posts', id);
            }
            slugs = post.parents ? _.clone(post.parents) : [];
            slugs.push(id);
            return slugs.join('/');
        },
        archive_path: function (archive, page) {
            var type = archive.type;
            var p;
            page = page || 0;

            switch (type) {
                case 'main':
                    p = 'posts';
                    break;
                case 'year':
                case 'month':
                case 'day':
                    p = path.join('posts', archive.slug);
                    break;
                case 'tag':
                    p = path.join('tags', archive.slug);
                    break;
                default:
                    throw(new Error('Unknown archive type'));
                    break;
            }
            if (page > 0) {
                p = path.join(p, 'page', page.toString());
            }
            return p;
        },
        search_path: function () {
            return 'search';
        }
    };




    async.series(
        [
            // Read the content/posts directory
            function(callback){
                var p = path.join(process.cwd(), 'options.js');
                if (program.verbose) console.log(colors.cyan('Reading site options from %s.'), p);
                fs.exists(p, function(exists){
                    if (! exists)  return callback('Missing options.js.');
                    options = _.extend({}, defaults, require(p));
                    callback(null);
                });
            }
        ],
        function(err){
            if (program.verbose && ! err) console.log(colors.green('Done!'));
            callback(err, options);
        }
    );




};


