#!/usr/bin/env node
'use strict';

var fs    = require ('fs');
var path  = require ('path');
var moduleName = 'xcraft';

var startUNPMService = function () {
  console.log ('[' + moduleName + '] Info: starting uNPM Server');

  var backend = require ('unpm-fs-backend');
  var dataDir = path.resolve ('./var/unpm');
  var data    = fs.readFileSync (path.resolve ('./etc/unpm/config.json'), 'utf8');
  var config  = JSON.parse (data);

  var tarballsDir = path.join (dataDir, 'tarballs');
  var userDir     = path.join (dataDir, 'users');
  var metaDir     = path.join (dataDir, 'meta');
  var storeDir    = path.join (dataDir, 'store');

  config.backend = backend (metaDir, userDir, tarballsDir, storeDir);

  var unpm = require ('unpm');
  var unpmService = unpm (config);
  unpmService.server.listen (unpmService.config.host.port);

  return unpmService;
};

var handle = startUNPMService ();

process.on ('SIGTERM', function () {
  handle.server.close ();
});
