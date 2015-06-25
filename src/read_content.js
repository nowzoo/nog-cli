/* jshint node: true */
module.exports = function (program, content_file_path, post_type, callback) {
    'use strict';
    var colors = require('colors');
    var async = require('async');
    var moment = require('moment');
    var fs = require('fs');
    var path = require('path');
    var _ = require('lodash');
    var S = require('string');
    var marked = require('marked');
    var yamlFront = require('yaml-front-matter');
    var stopwords = require('stopwords').english;

    var post = {};

    var ext = path.extname(content_file_path);

    // we only accept HTML and Markdown...
    if (_.indexOf(['.html', '.md'], ext.toLowerCase()) === -1){
        return callback(null, false);
    }

    async.series(
        [


            //initialize...
            function(callback){
                if (program.verbose) console.log(colors.gray('Initializing content data.'));
                post.type = post_type;
                post.has_error = false;
                post.errors = [];
                post.content_path = content_file_path;
                post.content_type = ext.toLowerCase() === '.html' ? 'html' : 'markdown';
                post.id = path.basename(content_file_path, ext);
                callback(null);
            },

            //read content...
            function(callback){
                if (program.verbose) console.log(colors.gray('Reading content from %s.'), post.content_path);
                fs.readFile(post.content_path, function(err, result){
                    var data = yamlFront.loadFront(result);
                    var meta = _.omit(data, '__content');

                    post.content_raw = data.__content;
                    post = _.extend(meta, post);
                    if (post.content_type === 'markdown'){
                        post.content = marked(post.content_raw);
                    } else {
                        post.content = post.content_raw;
                    }

                    callback(err);
                });
            },

            //read content stats...
            function(callback){
                if (program.verbose) console.log(colors.gray('Reading content file stats from %s.'), post.content_path);
                fs.stat(post.content_path, function(err, result){
                    post.content_file_stats = result;

                    callback(err);
                });
            },

            //populate title...
            function(callback){
                if (program.verbose) console.log(colors.gray('Normalizing title for %s.'), post.id);
                if (!_.has(post, 'title') || !_.isString(post.title) || post.title.length === 0){
                    post.has_error = true;
                    post.errors.push('No post title defined.');
                    post.title = post.id;
                }
                callback(null);
            },
            //populate tags...
            function(callback){
                if (program.verbose) console.log(colors.gray('Populating tags for %s.'), post.id);
                var tags = post.tags || '';
                if (_.isString(tags)){
                    tags = tags.split(',');
                }
                tags = _.isArray(tags) ? tags : [];
                tags = _.map(tags, function(val){return S(val).trim().s;});
                tags = _.filter(tags, function(val) {return val.length > 0});
                post.tags = _.uniq(tags);
                callback(null);
            },

            //populate excerpt...
            function(callback){
                if (program.verbose) console.log(colors.gray('Populating excerpt for %s.'), post.id);
                var excerpt = _.isString(post.excerpt) ? post.excerpt : '';
                excerpt = S(excerpt).trim().s;
                if (excerpt.length === 0){
                    post.has_error = true;
                    post.errors.push('No excerpt defined.');
                    excerpt = S(post.content).stripTags().trim().substring(0, 255).s;
                }
                post.excerpt = excerpt;
                callback(null);
            },

            //populate search...
            function(callback){
                if (program.verbose) console.log(colors.gray('Populating search words for %s.'), post.id);
                var search_words = post.title + ' ' + post.content + ' ' + post.excerpt + ' ' + post.tags.join(' ');
                search_words = S(search_words).stripTags().toLowerCase().split(/\W+/);
                search_words  = _.difference(search_words, stopwords);
                search_words = _.filter(search_words, function(val) {return val.length > 0});
                search_words = _.uniq(search_words);
                post.search_words = search_words;
                callback();
            },

            //normalize published_at...
            function(callback){
                if (program.verbose) console.log(colors.gray('Normalizing published_at for %s.'), post.id);
                var valid = [moment.ISO_8601, 'YYYY/MM/DD', 'YYYY/MM/DD HH:mm', 'YYYY/MM/DD HH:mm:ss'];
                var published_at = _.has(post, 'published_at') ? moment(post.published_at, valid) : moment.invalid();
                if (! published_at.isValid()){
                    post.has_error = true;
                    post.errors.push('No post published_at defined or invalid date.');
                    published_at = moment(post.content_file_stats.mtime);
                }
                post.published_at = published_at;
                callback();
            },
            //normalize the template...
            function(callback){
                if (program.verbose) console.log(colors.gray('Normalizing template for %s.'), post.id);
                post.template = _.isString(post.template) ? post.template : post.type + '.twig';
                callback();
            }

        ],
        function(err){
            if (! err && program.verbose) console.log(colors.green('Done!'));
            callback(err, post);
        }
    )


};



