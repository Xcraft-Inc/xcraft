'use strict';


exports.yamlFile2Json = function (yamlFile) {

  var yaml = require ('js-yaml');
  var fs   = require ('fs');

  var data = fs.readFileSync (yamlFile, 'utf8');

  var def = yaml.safeLoad (data);

  return def;
};

exports.jsonFile2Json = function (jsonFile) {

  var fs   = require ('fs');

  var data = fs.readFileSync (jsonFile, 'utf8');

  var r = JSON.parse (data);

  return r;
};
