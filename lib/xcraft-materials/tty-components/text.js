'use strict';

var util   = require ('util');
var reflux = require ('reflux');
var clc    = require ('cli-color');

var textStore = reflux.createStore (require ('../stores/textstore.js'));

module.exports = function () {
  var colors = {
    verb: clc.cyanBright,
    info: clc.greenBright,
    warn: clc.yellowBright,
    err:  clc.redBright
  };

  textStore.listen (function (mode, data) {
    var len = data.prefix.length + data.mod.length + 4;
    var max = 35;
    len = max - len;
    if (len < 0) {
      len = 0;
    }

    var spaces = mode.length < 4 ? '  ' : ' ';
    var begin = util.format ('%s [%s%s] %s:%s',
                             clc.blackBright (data.prefix),
                             clc.whiteBright.bold (data.mod),
                             new Array (len).join (clc.blackBright ('.')),
                             colors[mode] (mode.charAt (0).toUpperCase () + mode.slice (1)),
                             spaces);
    var offset = data.prefix.length + data.mod.length + len + mode.length + spaces.length + 5;
    var indent = new Array (offset).join (' ');
    var text = data.text.replace (/\n/g, '\n' + indent);

    console.log ('%s%s', begin, text);
  });
};
