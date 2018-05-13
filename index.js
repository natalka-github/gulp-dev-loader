'use strict';

const PLUGIN_NAME = 'gulp-dev-loader';

    var through = require('through'),
    util = require('gulp-util'),
    path = require('path'),
    slash = require('slash');

function devloader(options) {
    options = options || {};

    var filename = options.filename || 'unnamed.txt';
    var cwd = process.cwd();
    var contents = [];
    var lineBreak = getLineBreak(options.eol);
    var replacements = options.replacements || [];
    var prefix = options.prefix || '';
    var postfix = options.postfix || '';
    var postfixLastLine = options.postfixLastLine || postfix;
    var afterPath = options.afterPath || false;

    function getLineBreak(eol) {
        switch (eol) {
            case 'cr': return '\r';
            case 'crlf': return '\r\n';
            default: return '\n';
        }
    }

    function writeFile(file) {
        if ( afterPath != undefined ) {
            var fpath = slash(file.path);
            var pos = fpath.indexOf(afterPath);
            if ( pos >= 0 ) {
                var filename = fpath.substring( pos + afterPath.length );
            } else {
                var filename = fpath;
            }

        } else {
            var filename = file.relative;
        }

        filename = replace(filename);

        var str = "document.addEventListener('DOMContentLoaded', function(e) { var t = document.createElement('script'); document.body.appendChild(t); t.src = '"+filename+"';});";

        contents.push(str);
    }

    function replace(filepath) {
        return replacements.reduce(function (filepath, replacement) {
            return filepath.replace(replacement.pattern, replacement.replacement);
        }, filepath);
    }

    function endStream() {
        if (prefix || postfix || postfixLastLine) {
            for (var i = 0; i < contents.length - 1; i++) {
                contents[i] = prefix + contents[i] + postfix;
            }
            if (contents.length) {
                contents[contents.length - 1] = prefix + contents[contents.length - 1] + postfixLastLine;
            }
        }

        if (options.banner) {
            contents.unshift(options.banner);
        }

        if (options.footer) {
            contents.push(options.footer);
        }

        var file = new util.File({
            cwd: cwd,
            base: cwd,
            path: path.join(cwd, filename),
            contents: new Buffer(contents.join(lineBreak))
        });

        this.emit('data', file);
        this.emit('end');
    }

    return through(writeFile, endStream);
}

module.exports = devloader;