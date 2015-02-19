'use strict';


exports.yamlFile2Json = function (yamlFile) {
  var yaml = require ('js-yaml');
  var fs   = require ('fs');

  var data = fs.readFileSync (yamlFile, 'utf8');
  return yaml.safeLoad (data);
};

exports.jsonFile2Json = function (jsonFile) {
  var fs   = require ('fs');

  var data = fs.readFileSync (jsonFile, 'utf8');
  return JSON.parse (data);
};

exports.json2JsonFile = function (json, destFile) {
  var fs   = require ('fs');
  fs.writeFileSync (destFile, JSON.stringify (json), 'utf8');
};

exports.topic2Action = function (topic) {
  return topic.replace (/(.*)(\.[a-z])(.*)/,
                        '$1' + topic.replace (/.*\.([a-z]).*/,
                        '$1').toUpperCase () + '$3');
};

exports.md5 = function (data) {
  var crypto = require ('crypto');

  var md5 = crypto.createHash ('md5');
  md5.update (data);
  return md5.digest ('hex');
};
