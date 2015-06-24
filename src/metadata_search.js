/* jshint node: true */
module.exports = function (posts, callback) {
    'use strict';
    var _ = require('lodash');
    var S = require('string');


    var search = {};

    var add_search_word = function(word, path, title, excerpt, type, id){
        word = S(word).trim().toLowerCase().s;
        if (! _.has(search, word)){
            search[word] = [];
        }
        search[word].push({
            path: path,
            title: title,
            excerpt: excerpt,
            type: type,
            id: id
        });
    };

    _.each(posts, function(post){
        _.each(post.search_words, function(word){
            add_search_word(word, post.path, post.title, post.excerpt, post.type, post.id);
        })
    });
    callback(null, search);


};


