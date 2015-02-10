'use strict';

var moduleName = 'unpm';

var fs     = require ('fs');
var path   = require ('path');
var daemon = require ('../daemon.js') (moduleName, path.join (__dirname, 'server.js'), true);

var configFile = fs.readFileSync (path.resolve ('./etc/unpm/config.json'), 'utf8');
var config     = JSON.parse (configFile);

daemon.conf = {
  hostname: config.host.hostname,
  port:     config.host.port,
  fallback: config.fallback
};

module.exports = daemon;
