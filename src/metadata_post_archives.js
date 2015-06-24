/* jshint node: true */
module.exports = function (program, options, posts, callback) {
    'use strict';
    var colors = require('colors');
    var async = require('async');
    var moment = require('moment');
    var _ = require('lodash');
    var S = require('string');

    var get_options = require('./get_options');

    var main;
    var tags = {};
    var date_archives = {};




    var reverse_sort_archive_posts = function(archive){
        var chunked;
        var rpp = options.posts_per_page || 10;
        rpp = parseInt(rpp);
        if (isNaN(rpp)) rpp = 10;
        if (rpp < 1) rpp = 10;
        archive.posts.sort(function(a, b){
            if (a.published_at.isBefore(b.published_at)) return 1;
            if (a.published_at.isAfter(b.published_at)) return -1;
            return 0;
        });
        archive.post_count = archive.posts.length;
        archive.page_count = Math.ceil(archive.post_count/rpp);
        archive.posts_per_page = rpp;
        archive.paged = archive.page_count > 1;
        chunked = _.chunk(archive.posts, archive.posts_per_page);
        archive.pages = [];
        _.each(chunked, function(posts, i){
            var page = {
                posts: posts,
                page: i,
                path: options.archive_path(archive, i)
            };
            archive.pages.push(page);
        })
    };

    if (program.verbose) console.log(colors.gray.bold('Creating post archives.'));


    async.series(
        [

            function(callback){
                if (program.verbose) console.log(colors.cyan('Creating main post archive...'));
                // make the main archive...
                main = {
                    id: 'main',
                    name: 'Posts',
                    title: 'Posts',
                    posts: _.values(posts),
                    type: 'main',
                    slug: ''
                };

                reverse_sort_archive_posts(main);

                if (program.verbose) console.log(colors.cyan('Creating tag archives...'));
                // gather all the tags...
                _.each(posts, function(post){
                    var post_tags = post.tags;
                    _.each(post_tags, function(str){
                        var tag_id = S(str).trim().slugify().s;
                        if (!_.has(tags, tag_id)){
                            tags[tag_id] = {
                                id: tag_id,
                                slug: tag_id,
                                name: S(str).trim().s,
                                title: 'Posts tagged ' + S(str).trim().s,
                                posts: [],
                                type: 'tag'
                            };
                        }
                        tags[tag_id].push(post);
                    });
                });

                _.each(tags, function(tag){
                    if (program.verbose) console.log(colors.cyan('Creating tag archive for %s'), tag.name);
                    reverse_sort_archive_posts(tag);
                });

                //gather all the date-based archives...
                _.each(posts, function(post){
                    var published_at = post.published_at;
                    var date_types = {
                        year: {
                            title: 'Yearly Archive: ' + published_at.format('YYYY'),
                            name: published_at.format('YYYY'),
                            slug: published_at.format('YYYY')
                        },
                        month: {
                            title: 'Monthly Archive: ' + published_at.format('MMMM YYYY'),
                            name:  published_at.format('MMMM YYYY'),
                            slug: published_at.format('YYYY/MM')
                        },
                        day: {
                            title: 'Daily Archive: ' + published_at.format('LL'),
                            name:  published_at.format('LL'),
                            slug: published_at.format('YYYY/MM/DD')
                        }
                    };

                    _.each(date_types, function(data, type){
                        if (!_.has(date_archives, data.slug)){
                            date_archives[data.slug] = _.extend({}, data, {
                                id: data.slug,
                                date: moment(published_at),
                                type: type,
                                posts: []
                            });
                        }
                        date_archives[data.slug].posts.push(post);

                    });

                });

                _.each(date_archives, function(archive){
                    if (program.verbose) console.log(colors.cyan('Creating date archive for %s'), archive.name);
                    reverse_sort_archive_posts(archive);
                });
                callback();
            }
        ],
        function(err){
            callback(err, {
                main: main,
                tags: tags,
                date: date_archives
            });
        }
    );
};


