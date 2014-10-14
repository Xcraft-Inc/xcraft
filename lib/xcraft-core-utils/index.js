'use strict';


exports.yamlFile2Json = function (yamlFile) {

  var yaml = require ('js-yaml');
  var fs   = require ('fs');

  var data = fs.readFileSync (yamlFile, 'utf8');

  var def = yaml.safeLoad (data);

  return def;
};
