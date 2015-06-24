module.exports = function(repo, directory){
    var async = require('async');
    var fs =  require('fs');
    var ncp =  require('ncp').ncp;
    var path =  require('path');
    var colors = require('colors/safe');
    var sprintf = require('sprintf-js').sprintf;
    var exec = require('child_process').exec;


    var lib_path = path.dirname(__dirname);


    async.series(
        [
            // clone the repo...
            function(callback){
                var cmd = sprintf('git clone %s %s', repo, directory);
                console.log(colors.gray('Cloning %s...'), repo);
                exec(cmd, callback);
            },

            // Switch to the directory...
            function(callback){
                process.chdir(directory);
                callback(null);
            },

            // Empty the master branch...
            function(callback){
                var cmd = 'git rm -rf .';
                exec(cmd, callback);
            },

            // Add the initial files that go in the master branch...
            // - README.md copied from here
            // - .gitignore created from scratch
            // - the files in initial_site_files
            function(callback){
                console.log(colors.gray('Creating files...'));
                callback(null);
            },



            // copy README.md ...
            function(callback){
                var src = path.join(lib_path, 'README.md');
                var dst = path.join(process.cwd(), 'README.md');
                ncp(src, dst, callback);
            },

            // create .gitignore ...
            function(callback){
                var dst = path.join(process.cwd(), '.gitignore');
                var ignore = ['node_modules', '_site'];
                fs.writeFile(dst, ignore.join('\n'), callback);
            },

            // Copy initial_site_files...
            function(callback){
                var src = path.join(lib_path, 'initial_site_files');
                var dst = process.cwd();
                ncp(src, dst, callback)
            },

            // Add the files to git...
            function(callback){
                var cmd = 'git add -A';
                exec(cmd, callback);
            },

            // Commit on master...
            function(callback){
                var cmd = 'git commit -m "Initial nog commit"';
                exec(cmd, callback);
            },


            // Create gh-pages branch
            function(callback){
                var cmd = 'git checkout --orphan gh-pages';
                console.log(colors.gray('Creating gh-pages branch...'));
                exec(cmd, callback);
            },

            // Empty gh-pages branch...
            function(callback){
                var cmd = 'git rm -rf .';
                exec(cmd, callback);
            },

            // Add the initial files that go in the gh-pages branch...
            // - README.md copied from here
            // - .gitignore created from scratch

            // copy README.md ...
            function(callback){
                var src = path.join(lib_path, 'README.md');
                var dst = path.join(process.cwd(), 'README.md');
                ncp(src, dst, callback);
            },

            // create .gitignore ...
            function(callback){
                var dst = path.join(process.cwd(), '.gitignore');
                var ignore = ['node_modules', '_site'];
                fs.writeFile(dst, ignore.join('\n'), callback);
            },

            // Add the files to git on gh-pages...
            function(callback){
                var cmd = 'git add -A';
                exec(cmd, callback);
            },

            // Commit on gh-pages...
            function(callback){
                var cmd = 'git commit -m "Initial nog commit on gh-pages"';
                exec(cmd, callback);
            },

            // Checkout master
            function(callback){
                var cmd = 'git checkout master';
                exec(cmd, callback);
            }



        ],
        function(err){
            if (err){
                console.log(colors.red(err));
            } else {
                console.log(colors.green('Site successfully initialized in %s!'), directory);
            }
        }
    )
}
