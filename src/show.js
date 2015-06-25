/* jshint node: true */
module.exports = function (program, thing, otherthings, data) {
    'use strict';

    var _ = require('lodash');
    var grunt = require('grunt');
    var colors = require('colors');
    var sprintf = require('sprintf-js').sprintf;

    var header = function(title){
        var sep = colors.cyan.bold('--------------');
        console.log(sep,  colors.cyan.bold(title), sep);
    };
    var errors = function(errors){
        if (errors.length > 0){
            console.log(colors.red.bold('Errors (%s)'), errors.length);
            _.each(errors, function(e, i){
                console.log( colors.red(' ' + (i + 1) + '.', e));
            })
        }
    };



    var show_index = function () {
        console.log('');
        header('Home Page');
        console.log('');
        var post = data.index;
        console.log(colors.bold(post.title));
        console.log('ID:',  post.id);
        console.log('Path:',  post.path);
        console.log('Type:',post.type);
        console.log('Published:',post.published_at.format('LLLL'));
        errors(post.errors);
        console.log('');
    };

    var show_pages = function(){
        console.log('');
        header(sprintf('Pages (%s)', _.size(data.pages)));
        _.each(data.pages, function(post){
            console.log('');
            console.log(colors.bold(post.title));
            console.log('ID:',  post.id);
            console.log('Path:',  post.path);
            console.log('Type:',post.type);
            console.log('Published:',post.published_at.format('LLLL'));
            console.log('Page Parent:', post.parent ? post.parent.id : '[none]');
            errors(post.errors);

        });
    };

    var show_posts = function(){
        console.log('');
        header(sprintf('Posts (%s)', _.size(data.posts)));
        _.each(data.posts, function(post){
            console.log('');
            console.log(colors.bold(post.title));
            console.log('ID:',  post.id);
            console.log('Path:',  post.path);
            console.log('Type:',post.type);
            console.log('Published:',post.published_at.format('LLLL'));
            console.log('Tags:', grunt.log.wordlist(post.tags));
            errors(post.errors);

        });
        console.log('');
    };

    var show_archives = function(){
        console.log('');
        header(sprintf('Date Archives (%s)', _.size(data.archives.date)));
        _.each(data.archives.date, function(archive){
            console.log('');
            console.log(colors.bold(archive.name));
            console.log('ID:',  archive.id);
            console.log('Path:',  archive.pages[0].path);
            console.log('Posts:', _.size(archive.posts));

        });
        console.log('');
    };

    var show_tags = function(){
        console.log('');
        header(sprintf('Post Tags (%s)', _.size(data.archives.tags)));
        _.each(data.archives.tags, function(archive){
            console.log('');
            console.log(colors.bold(archive.name));
            console.log('ID:',  archive.id);
            console.log('Path:',  archive.pages[0].path);
            console.log('Posts:', _.size(archive.posts));

        });
        console.log('');
    };

    var show_search_words = function(){
        console.log('');
        header(sprintf('Search Words (%s)', _.size(data.search)));
        console.log('');
        _.each(data.search, function(arr, word){
            console.log(colors.bold(word),  _.size(arr), 'match(es)');
        });
        console.log('');
    };

    var things = {
        index: [show_index, 'Home page data'],
        pages: [show_pages, 'Pages data'],
        posts: [show_posts, 'Posts data'],
        archives: [show_archives, 'Post archives data'],
        tags: [show_tags, 'Post tags data'],
        search: [show_search_words, 'Search words data']
    }

    var show = [thing];
    if (_.isArray(otherthings)) show = show.concat(otherthings);
    var err = _.size(show) === 0;
    console.log(show, otherthings)

    _.each(show, function(what){
        if (!_.has(things, what)) err = true;
    });

    if (err){
        console.log(colors.red('Invalid arguments!'));
        console.log(colors.bold('Options:'));
        _.each(things, function(arr, str){
            console.log(colors.bold.cyan('nog show ' + str), colors.gray(arr[1]));
        });
        return;

    }
    _.each(show, function(thing){
        things[thing][0]();
    });

};



