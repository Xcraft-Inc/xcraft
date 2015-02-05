'use strict';
var path    = require ('path');
var fs      = require ('fs');
var isBuild = fs.existsSync (path.join (__dirname, '/release/'));


module.exports = {
  gadgetName: '<%= gadgetName %>',
  isBuild: isBuild,
  icon: 'mdi-content-archive'
};
