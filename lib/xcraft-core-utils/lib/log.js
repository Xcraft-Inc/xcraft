'use strict';

var util      = require ('util');
var clc       = require ('cli-color');
var ansiRegex = require ('ansi-regex');

var xUtils = require ('..');

var colors = {
  verb: clc.cyanBright.bold,
  info: clc.greenBright.bold,
  warn: clc.yellowBright.bold,
  err:  clc.redBright.bold
};

var indent = 20;


exports.getIndent = function () {
  return indent;
};

exports.computeIndent = function (prefix, mod) {
  var len = prefix.length + mod.length + 2;
  len = indent - len;
  if (len < 0) {
    indent += -len;
    len = 0;
  }

  return len;
};

exports.decorate = function (mode, prefix, mod, log) {
  var len = exports.computeIndent (prefix, mod);
  var spaces = mode.length < 4 ? '  ' : ' ';
  var begin = util.format ('%s [%s%s] %s:%s',
                           prefix,
                           clc.whiteBright.bold (mod),
                           new Array (len + 1).join (clc.blackBright ('.')),
                           colors[mode] (xUtils.string.capitalize (mode)),
                           spaces);
  var text = log.replace (/\n/g, ' \n') + ' ';

  var beginLength = begin.replace (ansiRegex (), '').length;
  var availableSpace = clc.windowSize.width - beginLength - 1;
  if (availableSpace <= 0) {
    return util.format ('%s%s', begin, text);
  }

  var output = '';
  spaces = new Array (beginLength + 1).join (' ');
  /* Example with an available space of 120 chars.
   * (.{1,119}[ /\\\\]|.{120})
   */
  var regex = new RegExp ('(.{1,' + (parseInt (availableSpace) - 1) + '}[ /\\\\]|.{' + availableSpace + '})', 'g');
  var matches = text.match (regex) || [text];
  matches.forEach (function (part, index) {
    output += util.format ('%s%s', begin, part);
    if (index < matches.length - 1) {
      output += '\n';
    }
    begin = spaces;
  });

  return output;
};
