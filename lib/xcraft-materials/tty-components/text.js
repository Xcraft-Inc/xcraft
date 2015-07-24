'use strict';

var reflux = require ('reflux');
var clc    = require ('cli-color');

var textStore = reflux.createStore (require ('../stores/textstore.js'));

module.exports = function () {
  var log = require ('xcraft-core-utils').log;

  textStore.listen (function (mode, data) {
    process.stdout.write (clc.erase.lineLeft);
    process.stdout.write (clc.move.left (clc.windowSize.width - 1));
    console.log (log.decorate (mode, data.prefix, data.mod, data.text));
  });
};
