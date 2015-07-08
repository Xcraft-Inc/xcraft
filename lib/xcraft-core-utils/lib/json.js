'use strict';

var fs = require ('fs');


exports.fromFile = function (jsonFile) {
  var data = fs.readFileSync (jsonFile, 'utf8');
  return JSON.parse (data);
};

exports.toFile = function (json, destFile) {
  fs.writeFileSync (destFile, JSON.stringify (json), 'utf8');
};
