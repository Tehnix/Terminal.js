/*jslint nomen: false, plusplus: false, todo: true, browser: true */

/*
Copyright (c) 2012, Christian Kjær Laustsen (Tehnix)
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of the <organization> nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

(function ($, window, undefined) {
    "use strict";

    var defaults,
        opts,
        currentPlace,
        currentPath,
        cmdHistory = [],
        currentHistoryCmd = null,
        $textCont,
        commands;
    
    function getNextHistoryCommand() {
        if (currentHistoryCmd === null) {
            if (cmdHistory.length === 0) {
                return '';
            }
            currentHistoryCmd = 0;
            return cmdHistory[0];
        }
        if (cmdHistory.length > (currentHistoryCmd + 1)) {
            currentHistoryCmd = currentHistoryCmd + 1;
        } 
        return cmdHistory[currentHistoryCmd];
    }
    
    function getPrevHistoryCommand() {
        if (currentHistoryCmd === null) {
            return '';
        }
        if (currentHistoryCmd !== 0) {
            currentHistoryCmd = currentHistoryCmd - 1;
            return cmdHistory[currentHistoryCmd];
        }
        currentHistoryCmd = null;
        return '';
    }
    
    function appendToHistory(cmd) {
        if (cmdHistory.length < parseInt(opts.commandHistory, 10)) {
            // Put the new command in at the first index (easier to handle when fetching it)
            cmdHistory.reverse();
            cmdHistory.push(cmd);
            cmdHistory.reverse();
        } else {
            cmdHistory.pop();
        }
    }

    function prompt() {
        return opts.user + "@" + opts.domain + " [" + currentPath + "]# ";
    }

    function append(text, $elem) {
        if (!$elem) {
            $elem = $textCont;
        }
        $elem.append('<p class="terminal-text">' + text + '</p>');
    }

    function stringToPath(pathText) {
        var filesystem = opts.filesystem,
            path = pathText.split('/'),
            pathObj = {},
            i = 0;
        for (i = 0; i < path.length; i++) {
            if (path[i] === '') {
                pathObj = filesystem.root;
            } else {
                pathObj = pathObj[path[i]];
            }
        }
        return pathObj;
    }
    
    commands = {
            ls: function (notUsed) {
                var dirList = "";
                $.each(currentPlace, function (i, dir) {
                    if (dir.__name__) {
                        if (dir.__type__) {
                            dirList += '<span class="terminal-ls-' + dir.__type__ + '">';
                            dirList += dir.__name__ + '</span> ';
                        } else {
                            dirList += '<span class="terminal-ls-dir">'; 
                            dirList += dir.__name__ + '</span> ';
                        }
                    }
                });
                append(dirList);
            },
            cd: function (where) {
                var tmpCurrentPath = currentPath,
                    whereSplit = where.split('/'),
                    prepend,
                    i = 0;
                // strip trailing slash
                if (where.length > 1 && where[where.length - 1] === '/') {
                    where = where.substring(0, where.length - 1);
                    whereSplit = where.split('/');
                }
                for (i = 0; i < whereSplit.length; i++) {
                    if (i === 0 && whereSplit[i] === '') {
                        whereSplit[i] = '/';
                    }
                    var tmpWhere = whereSplit[i];
                    if (i === 1 && whereSplit[i] === '') {
                        break;
                    } else if (tmpWhere !== '__name__' && currentPlace.hasOwnProperty(tmpWhere)) {
                        if (currentPlace[tmpWhere].__type__ === undefined) {
                            prepend = '/';
                            if (currentPath === '/') {
                                prepend = '';
                            }
                            currentPath += prepend + tmpWhere;
                            currentPlace = stringToPath(currentPath);
                        } else if (currentPlace[tmpWhere].__type__ === 'link') {
                            window.open(currentPlace[tmpWhere].__link__, '_blank');
                        } else {
                            append('-bash: cd: ' + tmpWhere + ': Not a directory');
                        }
                    } else if (tmpWhere === '..') {
                        currentPath = currentPath.split('/');
                        currentPath.pop();
                        currentPath = currentPath.join('/');
                        currentPlace = stringToPath(currentPath);
                    } else if (tmpWhere === '/') {
                        currentPath = '/';
                        currentPlace = stringToPath(currentPath);
                    } else {
                        // If the last file is not found, reset it to the original currentPath
                        currentPath = tmpCurrentPath;
                        append('-bash: cd: No such file or directory: ' + where);
                        break;
                    }
                }
                $(document).trigger('CURRENTPATH_HAS_BEEN_CHANGED');
            },
            cat: function (file) {
                 if (currentPlace.hasOwnProperty(file) && currentPlace[file].__type__ === 'file') {
                    file = currentPlace[file];
                    if (file.__text__ !== undefined) {
                        append(file.__text__);
                    }
                 }
            }

        };

    $.fn.terminal = function (options) {
        defaults = {
            user: 'Guest',
            domain: 'site.com',
            location: '/home/www',
            startText: 'Welcome!',
            autoFocus: true,
            filesystem: {
                root: {
                    home: {
                        www: {}    
                    }
                }
            },
            commandHistory: 100
        };
        opts = $.extend(defaults, options);
        var $cont = this;

        return this.each(function () {
            currentPath = opts.location;
            currentPlace = stringToPath(opts.location);
            // These will be the containers of our text and input
            $cont.append('<div id="terminal-text-container"></div>');
            $cont.append([
                '<div id="terminal-input-container">',
                '<span id="terminal-input-prepend">',
                prompt(opts),
                '</span><input id="terminal-input" type="text" />',
                '</div>'
            ].join(""));
            $textCont = $("#terminal-text-container");
            var $inputCont = $("#terminal-input-container"),
                $inputPrepend = $("#terminal-input-prepend"),
                $input = $("#terminal-input");

            // Remove the styling on the input
            $input.css({
                border: 'none',
                background: 'none',
                outline: 'none'
            });

            $input.keypress(function (event) {
                if (event.which === 13) {
                    // Enter is pressed
                    var cmds = $input.val().split(' '),
                        additional = '';
                    $input.hide();
                    if ($input.val() === '') {
                        append(prompt());
                    } else if (commands.hasOwnProperty(cmds[0])) {
                        if (cmds[1] !== undefined) {
                            additional = cmds[1];
                        }
                        append(prompt() + $input.val());
                        commands[cmds[0]](additional);
                        appendToHistory($input.val());
                    } else {
                        append(prompt() + $input.val());
                        append('-bash: ' + $input.val() + ': command not found');
                    }
                    currentHistoryCmd = null;
                    $input.val('');
                    $input.show();
                }
            });
            $input.keydown(function (event) {
                if (event.which === 38) {
                    // The up arrow is pressed
                    event.preventDefault();
                    $input.val(getNextHistoryCommand());
                } else if (event.which === 40) {
                    // The down arrow is pressed
                    event.preventDefault();
                    $input.val(getPrevHistoryCommand());
                }
            });

            $(document).on('CURRENTPATH_HAS_BEEN_CHANGED', function () {
                $inputPrepend.html(prompt());
            });
            
            if (opts.startText !== '') {
                append(prompt() + opts.startText);
            }
            if (opts.autoFocus) {
                $input.focus();
            }
        });
    };

}(jQuery, window));
