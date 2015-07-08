'use strict';

var fs = require ('fs');


exports.fromFile = function (yamlFile) {
  var yaml = require ('js-yaml');

  var data = fs.readFileSync (yamlFile, 'utf8');
  return yaml.safeLoad (data);
};
