#!/usr/bin/env node
var async = require('async');
var program = require('commander');
var path =  require('path');
var colors = require('colors/safe');

var init = require('./src/init');
var metadata = require('./src/metadata');
var build = require('./src/build');
var push = require('./src/push');
var show = require('./src/show');

program
    .version('0.0.1');

program
    .command('init <repo> [directory]')
    .description('initialize a Nog site from the empty repository <repo>.  Optionally, specify a [directory]')
    .action(function(repo, dir){
        var directory;
        dir = dir || null;
        directory = dir ? path.resolve(dir) : path.resolve(path.basename(repo, '.git'));
        console.log(colors.black.bold('Initializing a new site in %s'), directory);
        init(repo, directory);
    });



program
    .command('build')
    .description('Build the site')
    .action(function(){
        var data;
        async.series(
            [
                function(callback){
                    metadata(program, function(err, result){
                        data = result;
                        callback(err);
                    });
                },
                function(callback){
                    build(program, data, callback);
                }
            ],
            function(err){
                if (err){
                    console.log(colors.red.bold(err));
                } else {
                    console.log(colors.green.bold('Done!'));
                }
            }
        );
    });

program
    .command('push')
    .description('Push the site to GitHub')
    .action(function(){
        var data;
        async.series(
            [
                function(callback){
                    metadata(program, function(err, result){
                        data = result;
                        callback(err);
                    });
                },
                function(callback){
                    build(program, data, callback);
                },
                function(callback){
                    push(program, data, callback);
                }
            ],
            function(err){
                if (err){
                    console.log(colors.red.bold(err));
                } else {
                    console.log(colors.green.bold('Done!'));
                }
            }
        );
    });

program
    .command('show <thing> [otherthings...]')
    .description('Show site data')
    .action(function(thing, otherthings){

        metadata(program, function(err, data){
            if (err){
                console.log(colors.red.bold(err));
            } else {
                show(program, thing, otherthings, data);
            }
        });
    });

program.parse(process.argv);