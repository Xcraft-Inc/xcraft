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

function colorIndexes (text) {
  const regex = ansiRegex ();
  const list = [];
  let res;
  while ((res = regex.exec (text))) {
    list.push ({
      color: res[0],
      index: res.index
    });
  }
  return list;
}

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

exports.decorate = function (mode, prefix, mod, log, maxWidth) {
  if (!maxWidth) {
    maxWidth = clc.windowSize.width;
  }

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
  var availableSpace = maxWidth - beginLength - 1;
  if (availableSpace <= 0) {
    return util.format ('%s%s', begin, text);
  }

  /* Retrieve the position of all ANSI colors. */
  let colorsOffset = 0;
  const colorsList = colorIndexes (text);
  if (colorsList.length) {
    text = text.replace (ansiRegex (), '');
  }

  var output = '';
  spaces = new Array (beginLength + 1).join (' ');
  /* Example with an available space of 120 chars.
   * (.{1,119}[ /\\]|.{120})
   */
  var regex = new RegExp ('(.{1,' + (parseInt (availableSpace) - 1) + '}[ /\\\\]|.{' + availableSpace + '})', 'g');
  var matches = text.match (regex) || [text];
  matches.forEach (function (part, index) {
    output += begin + part;
    colorsOffset += begin.length;

    /* Restore the colors */
    while (colorsList.length) {
      const offset = colorsList[0].index + colorsOffset;
      if (offset < output.length) {
        output = output.substr (0, offset) + colorsList[0].color + output.substr (offset);
        colorsList.shift ();
      } else {
        break;
      }
    }

    if (index < matches.length - 1) {
      output += '\n';
      colorsOffset++;
    }
    begin = spaces;
  });

  return output;
};
