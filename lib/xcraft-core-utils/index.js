'use strict';

var fs     = require ('fs');

exports.yamlFile2Json = function (yamlFile) {
  var yaml = require ('js-yaml');

  var data = fs.readFileSync (yamlFile, 'utf8');
  return yaml.safeLoad (data);
};

exports.topic2Action = function (topic) {
  return topic.replace (/(\.[a-z])/g, function (match) {
    return match.replace ('.', '').toUpperCase ();
  });
};

exports.crypto = require ('./lib/crypto.js');
exports.json   = require ('./lib/json.js');
exports.string = require ('./lib/string.js');
