'use strict';

exports.toRegexp = function (value) {
  if (value instanceof RegExp) {
    return value;
  }

  var escapeStringRegexp = require ('escape-string-regexp');
  return new RegExp ('^' + escapeStringRegexp (value) + '$');
};
