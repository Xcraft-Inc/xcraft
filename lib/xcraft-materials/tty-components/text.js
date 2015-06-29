'use strict';

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
    console.log ('%s%s', clc.redBright (data.prefix) || '', colors[mode] (data.text));
  });
};
