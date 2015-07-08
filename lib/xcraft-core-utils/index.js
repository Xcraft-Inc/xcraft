'use strict';

exports.topic2Action = function (topic) {
  return topic.replace (/(\.[a-z])/g, function (match) {
    return match.replace ('.', '').toUpperCase ();
  });
};

exports.crypto = require ('./lib/crypto.js');
exports.json   = require ('./lib/json.js');
exports.string = require ('./lib/string.js');
exports.yaml   = require ('./lib/yaml.js');
