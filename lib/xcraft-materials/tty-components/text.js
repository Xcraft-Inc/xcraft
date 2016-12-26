'use strict';

var reflux = require ('reflux');
var clc    = require ('cli-color');

var textStore = reflux.createStore (require ('../stores/textstore.js'));

module.exports = function () {
  var log = require ('xcraft-core-utils').log;

  let previous = null;

  textStore.listen (function (mode, data) {
    const begin = mode + data.prefix + data.mod;
    const stripBegin = begin === previous;

    /* Do not repeat the begining for each line in the case of embedded logs */
    if (!stripBegin) {
      previous = begin;
    }

    process.stdout.write (clc.erase.lineLeft);
    process.stdout.write (clc.move.left (clc.windowSize.width - 1));
    console.log (log.decorate (mode, data.prefix, data.mod, data.text, null, stripBegin));
  });
};
