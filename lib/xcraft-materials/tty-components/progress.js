'use strict';

var util     = require ('util');
var reflux   = require ('reflux');
var clc      = require ('cli-color');
var Progress = require ('progress');

var progressStore = reflux.createStore (require ('../stores/progressstore.js'));

/**
 * Usual progress bar.
 *
 * @class ProgressBar
 * @param {string} format
 */
function ProgressBar (format) {
  var opts = {
    complete: '=',
    incomplete: ' ',
    width: 40,
    total: 1000,
    stream: process.stdout
  };

  ProgressBar.super_.call (this, format, opts);
}

util.inherits (ProgressBar, Progress);

/**
 * Progress under the rotary form.
 *
 * @class ProgressInf
 * @param {string} format
 */
function ProgressInf (format) {
  var opts = {
    complete: ' ',
    incomplete: ' ',
    width: 1,
    total: 2,
    stream: process.stdout
  };

  this._tick      = -1;
  this._nextChar  = 0;
  this._waitChars = [
    '/', '-', '\\', '|'
  ];

  ProgressInf.super_.call (this, format, opts);
}

util.inherits (ProgressInf, Progress);

ProgressInf.prototype.tick = function (tokens) {
  this._tick = -this._tick;
  this.chars.complete   = this._waitChars[this._nextChar++ % this._waitChars.length];
  this.chars.incomplete = this.chars.complete;

  ProgressInf.super_.prototype.tick.call (this, this._tick, tokens);
};

/*****************************************************************************/

module.exports = function () {
  var format = util.format ('%s %s %s%s%s',
                            clc.redBright ('***'),
                            clc.greenBright (':topic'),
                            clc.whiteBright ('['),
                            clc.magentaBright (':bar'),
                            clc.whiteBright (']'));

  var progressBar = new ProgressBar (format + ' ' + clc.whiteBright (':percent') + ' :etas ');
  var progressInf = new ProgressInf (format + ' ... ');

  var prevPos = -1;

  progressStore.listen (function (data) {
    if (prevPos === data.position) {
      return;
    }

    prevPos = data.position;

    if (data.length < 0) {
      progressInf.tick ({
        topic: data.topic
      });
    } else {
      progressBar.update (data.position / data.length, {
        topic: data.topic
      });

      if (data.position === data.length) {
        progressBar.terminate ();
      }
    }
  });
};
