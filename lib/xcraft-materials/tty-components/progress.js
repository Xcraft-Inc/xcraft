'use strict';

var util     = require ('util');
var reflux   = require ('reflux');
var clc      = require ('cli-color');
var Progress = require ('progress-with-fix');

var log = require ('xcraft-core-utils').log;

var progressStore = reflux.createStore (require ('../stores/progressstore.js'));

/**
 * Usual progress bar.
 *
 * @class ProgressBar
 * @param {string} format
 */
function ProgressBar (format) {
  var width = parseInt (clc.windowSize.width / 2) - 1;
  if (width > 80) {
    width = 80;
  }

  var opts = {
    complete: '=',
    incomplete: ' ',
    width: width,
    total: 100,
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
  var format = util.format ('%s [%s%s] %s: %s%s%s -- %s',
                            ':prefix',
                            clc.whiteBright.bold (':mod'),
                            clc.blackBright (':empty'),
                            clc.greenBright.bold ('Info'),
                            clc.whiteBright ('['),
                            clc.blackBright (':bar'),
                            clc.whiteBright (']'),
                            clc.greenBright (':topic'));

  var progressBar = new ProgressBar (format + ' ' + clc.whiteBright (':percent') + ' :etas ');
  var progressInf = new ProgressInf (format + ' ... ');

  var lastRatio = -1;

  progressStore.listen (function (data) {
    var ratio = data.position / data.length;

    if (ratio > 1.0) {
      ratio = 1.0;
    } else if (ratio < 0.0) {
      ratio = 0.0;
    }

    if (lastRatio !== -1 && ratio >= progressBar.total / 100) {
      return;
    }

    log.computeIndent (data.prefix, data.mod);
    var len = data.prefix.length + data.mod.length + 2;
    var max = log.getIndent ();
    len = max - len;
    if (len < 0) {
      len = 0;
    }

    if (data.length < 0) {
      progressInf.tick ({
        prefix: data.prefix,
        mod:    data.mod,
        empty:  new Array (len + 1).join ('.'),
        topic:  data.topic
      });
    } else {
      progressBar.update (ratio, {
        prefix: data.prefix,
        mod:    data.mod,
        empty:  new Array (len + 1).join ('.'),
        topic:  data.topic
      });

      lastRatio = progressBar.curr === progressBar.total ? ratio : -1;
    }
  });
};
