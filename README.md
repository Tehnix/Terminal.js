## Terminal.js ##

A minimal javascript terminal emulator

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
\__type__: 'file' <code>// A file, which you can `cat` the content of</code>

\__type__: 'link' <code>// A link which when you cd to it, opens a new window</code>

If there is not defined a \__type__, it will expect a directory like object

## JSLint ##
It should gracefully pass jslint with the applied settings, except for one error:
<pre>
    Expected an identifier and instead saw 'undefined' (a reserved word).
    (function ($, window, undefined) {
</pre>

Which I'm not going to do anything about since this way is a security measure against redefining `undefined` to true or anything in the likes.

## Example of usage ##
Currently I'm using it on one of my own sites as a fun little gimmick, I'll show you the code below and hopefully you'll grasp the concept:
https://gist.github.com/3389412

(Had some problems pasting it directly here, so I made a gist of it...)