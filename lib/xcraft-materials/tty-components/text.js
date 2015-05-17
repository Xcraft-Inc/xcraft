'use strict';

var reflux = require ('reflux');
var clc    = require ('cli-color');

var textStore = reflux.createStore (require ('../stores/textstore.js'));

module.exports = function () {
  var colors = {
    info: clc.greenBright,
    warn: clc.yellowBright,
    err:  clc.redBright
  };
  var inc = 1;
  var begin = ['*', '*', '*'];

  textStore.listen (function (mode, data) {
    var s = '';
    begin.forEach (function (c) {
      s += inc % 4 ? clc.red (c) : clc.redBright (c);
      ++inc;
    });

    console.log ('%s %s', s, colors[mode] (data.text));
  });
};
