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
