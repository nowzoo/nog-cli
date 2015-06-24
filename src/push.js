module.exports = function(program, metadata, callback){
    var async = require('async');
    var _ =  require('lodash');
    var fs =  require('fs');
    var moment =  require('moment');
    var ncp =  require('ncp').ncp;
    var rimraf =  require('rimraf');
    var path =  require('path');
    var colors = require('colors/safe');
    var sprintf = require('sprintf-js').sprintf;
    var exec = require('child_process').exec;

    var file_list;



    async.series(
        [
            // Make sure we're on master...
            function(callback){
                console.log(colors.gray('Checking out master:'), colors.bgBlack.white('git checkout master'))
                exec(
                    'git checkout master',
                    function (error) {
                        callback(error)
                    }
                );
            },
            // Add all the changes...
            function(callback){
                console.log(colors.gray('Add:'), colors.bgBlack.white('git add -A'))
                exec(
                    'git add -A',
                    function (error) {
                        callback(error)
                    }
                );
            },
            // Commit the changes...
            function(callback){
                var cmd = sprintf('git commit -m \'Automated nog commit on %s\'', moment().toISOString());
                console.log(colors.gray('Commit:'), colors.bgBlack.white(cmd));
                exec(cmd, function(err, stdout, stderr){
                    if (err){
                        console.log(colors.black(stdout));
                    }
                    callback();
                });
            },
            // Push the changes...
            function(callback){
                var cmd = 'git push origin master';
                console.log(colors.gray('Push the master branch:'), colors.bgBlack.white(cmd));
                exec(cmd, function(err, stdout, stderr){
                    if (err){
                        console.log(colors.black(stdout));
                    }
                    callback();
                });
            },
            // Checkout gh-pages...
            function(callback){
                var cmd = 'git checkout gh-pages';
                console.log(colors.gray('Checkout:'), colors.bgBlack.white(cmd));
                exec(cmd, function(err, stdout, stderr){
                    if (err){
                        console.log(colors.black(stdout));
                    }
                    callback();
                });
            },

            function(callback){
                fs.readdir(process.cwd(), function(err, result){
                    file_list = result;
                    callback(err);
                })
            },

            function(callback){
                var keep = ['README.md', 'node_modules', '.gitignore', '_site'];
                async.each(file_list, function(name, callback){
                    if (_.indexOf(keep, name) !== -1) return callback();
                    if (name.indexOf('.') === 0) return callback();
                    rimraf(name, callback);
                }, callback)
            },

            function(callback){
                var src = path.join(process.cwd(), '_site');
                var dst = process.cwd();
                ncp(src, dst, callback);
            },

            // Add all the changes...
            function(callback){
                console.log(colors.gray('Add:'), colors.bgBlack.white('git add -A'));
                exec(
                    'git add -A',
                    function (error) {
                        callback(error)
                    }
                );
            },
            // Commit the changes...
            function(callback){
                var cmd = sprintf('git commit -m \'Automated nog commit to gh-pages on %s\'', moment().toISOString());
                console.log(colors.gray('Commit:'), colors.bgBlack.white(cmd));
                exec(cmd, function(err, stdout, stderr){
                    if (err){
                        console.log(colors.black(stdout));
                    }
                    callback();
                });
            },
            // Push the changes...
            function(callback){
                var cmd = 'git push origin gh-pages';
                console.log(colors.gray('Push the master branch:'), colors.bgBlack.white(cmd));
                exec(cmd, function(err, stdout, stderr){
                    if (err){
                        console.log(colors.black(stdout));
                    }
                    callback();
                });
            },
            // Checkout gh-pages...
            function(callback){
                var cmd = 'git checkout master';
                console.log(colors.gray('Checkout:'), colors.bgBlack.white(cmd));
                exec(cmd, function(err, stdout, stderr){
                    if (err){
                        console.log(colors.black(stdout));
                    }
                    callback();
                });
            },


        ],
        callback
    )
}
