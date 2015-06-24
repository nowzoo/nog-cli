#!/usr/bin/env node
var program = require('commander');
var path =  require('path');
var colors = require('colors/safe');

var init = require('./src/init');

var metadata = require('./src/metadata');

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
    .option('-v, --verbose', 'Verbose')
    .action(function(){

        metadata(program, function(err, data){
            if (err){
                console.log(colors.red.bold(err));
            } else {
                console.log(data);
            }
        });
    });

program.parse(process.argv);