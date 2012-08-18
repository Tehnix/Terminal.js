## Terminal.js ##

A minimal javascript terminal emulator

## JSLint ##
It should gracefully pass jslint with the applied settings, except for one error:
<pre>
    Expected an identifier and instead saw 'undefined' (a reserved word).
    (function ($, window, undefined) {
</pre>

Which I'm not going to do anything about since this way is a security measure against redefining `undefined` to true or anything in the likes.

## Options ##
<pre>
user : 'Guest' // Specifies the user to show in the prompt line
domain: 'site.com', // Specifies the domain to show in the prompt line
location: '/home/www', // The starting location of the terminal (the path must be preset in the filesystem tree)
startText: 'Welcome!', // What to display to the user when the terminal is invoked (if it is an empty string, nothing is displayed)
autoFocus: true, // If the input should automatically have the users focus
filesystem: {
    root: {
        home: {
            www: {}    
        }
    }
}, // This is where you build how the filesystem for the terminal should look like, see the example of usage for a concept of what you can do
commandHistory: 100 // The limit on the command history (up and down arrows)
</pre>

## Types in the file system ##
__type__: 'file' // A file, which you can `cat` the content of
__type__: 'link' // A link which when you cd to it, opens a new window

If there is not defined a __type__, it will except a directory like object

## Example of usage ##
Currently I'm using it on one of my own sites as a fun little gimmick, I'll show you the code below and hopefully you'll grasp the concept:

<pre>
    $(document).ready(function() {
        var githubDir = {
            __name__: 'github',
            Tehnix: {
                __name__: 'Tehnix'
            },
            ZealDev: {
                __name__: 'ZealDev'
            }
        };
        
        // Fetch my repository information from github. The reason I call a local .php file instead of
        // directly to the github API, is because AJAX calls are limited to your own domain. The php files basically just
        // does a call to the API with curl...
        $.get('/github-repos-Tehnix.php').done(function(data) {
            // Fetch the crap
            data = $.parseJSON(data);
            for (var i=0; i < data.length; i++) {
                githubDir.Tehnix[data[i].name] = {
                    __name__: data[i].name,
                    link: {
                        __name__: 'link',
                        __type__: 'link',
                        __link__: data[i].html_url
                    },
                    'Description.txt': {
                        __name__: 'Description.txt',
                        __type__: 'file',
                        __text__: data[i].description
                    }

                }
            }
        });
        $.get('/github-repos-ZealDev.php').done(function(data) {
            // Fetch the crap
            data = $.parseJSON(data);
            for (var i=0; i < data.length; i++) {
                githubDir.ZealDev[data[i].name] = {
                    __name__: data[i].name,
                    link: {
                        __name__: 'link',
                        __type__: 'link',
                        __link__: data[i].html_url
                    },
                    'Description.txt': {
                        __name__: 'Description.txt',
                        __type__: 'file',
                        __text__: data[i].description
                    }
                }
            }
        });
        
        // Instantiate the terminal plugin on the container with id terminal
        $("#terminal").terminal({
            domain: 'zealdev.dk',
            startText: 'Welcome! Take a look around, who knows, maybe you\'ll find something interesting :) !...',
            filesystem: {
                root: {
                    __name__: '/',
                    home: {
                        __name__: 'home',
                        www: {
                            __name__: 'www',
                            github: githubDir,
                            'about.txt': {
                                __name__: 'about.txt',
                                __type__: 'file',
                                __text__: 'Hey there :) I see you\'ve manage to figure out how this operates. If you\'re interested in the plugin itself, it is hosted on github (or very soon will be) and you can check it out there...'
                            }
                        }
                    }
                }
            }
        });
    });
</pre>