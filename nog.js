#!/usr/bin/env node
var async = require('async');
var program = require('commander');
var path =  require('path');
var colors = require('colors/safe');

var init = require('./src/init');
var metadata = require('./src/metadata');
var build = require('./src/build');

program
    .version('0.0.1')
    .option('-v, --verbose', 'Verbose');

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
    .command('meta')
    .description('Show site meta')
    .action(function(){

        metadata(program, function(err, data){
            if (err){
                console.log(colors.red.bold(err));
            } else {
                //console.log(data);
            }
        });
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

program.parse(process.argv);