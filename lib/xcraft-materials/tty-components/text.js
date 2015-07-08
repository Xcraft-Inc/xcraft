'use strict';

var util   = require ('util');
var reflux = require ('reflux');
var clc    = require ('cli-color');
var ansiRegex = require ('ansi-regex');

var xUtils = require ('xcraft-core-utils');

var textStore = reflux.createStore (require ('../stores/textstore.js'));

module.exports = function () {
  var colors = {
    verb: clc.cyanBright.bold,
    info: clc.greenBright.bold,
    warn: clc.yellowBright.bold,
    err:  clc.redBright.bold
  };

  textStore.listen (function (mode, data) {
    var len = data.prefix.length + data.mod.length + 2;
    var max = 28;
    len = max - len;
    if (len < 0) {
      len = 0;
    }

    var spaces = mode.length < 4 ? '  ' : ' ';
    var begin = util.format ('%s [%s%s] %s:%s',
                             data.prefix,
                             clc.whiteBright.bold (data.mod),
                             new Array (len).join (clc.blackBright ('.')),
                             colors[mode] (xUtils.string.capitalize (mode)),
                             spaces);
    var text = data.text.replace (/\n/g, ' \n') + ' ';

    var beginLength = begin.replace (ansiRegex (), '').length;
    var availableSpace = clc.windowSize.width - beginLength - 1;
    if (availableSpace <= 0) {
      console.log ('%s%s', begin, text);
      return;
    }

    spaces = new Array (beginLength + 1).join (' ');
    /* Example with an available space of 120 chars.
     * (.{1,119}[ /\\\\]|.{120})
     */
    var regex = new RegExp ('(.{1,' + (parseInt (availableSpace) - 1) + '}[ /\\\\]|.{' + availableSpace + '})', 'g');
    var matches = text.match (regex) || [text];
    matches.forEach (function (part) {
      console.log ('%s%s', begin, part);
      begin = spaces;
    });
  });
};
