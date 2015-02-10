'use strict';

var moduleName = 'watcher';

var path   = require ('path');
var daemon = require ('../daemon.js') (moduleName, path.join (__dirname, 'server.js'), true);

module.exports = daemon;
