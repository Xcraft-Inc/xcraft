'use strict';

var moduleName = 'unpm';

var fs    = require ('fs');
var path  = require ('path');
var spawn = require ('child_process').spawn;

var pidFile = './var/run/unpmd.pid';
var logFile = './var/log/unpmd.log';

var configFile = fs.readFileSync (path.resolve ('./etc/unpm/config.json'), 'utf8');
var config     = JSON.parse (configFile);


exports.conf = {
  hostname: config.host.hostname,
  port:     config.host.post,
  fallback: config.fallback
};

exports.start = function () {
  var isRunning = false;
  if (fs.existsSync (pidFile)) {
    console.warn ('[' + moduleName + '] Warn: the unpm server seems running');

    isRunning = true;
    var pid = fs.readFileSync (pidFile, 'utf8');

    try {
      process.kill (pid, 0);
    } catch (err) {
      if (err.code === 'ESRCH') {
        console.warn ('[' + moduleName + '] Warn: but the process can not be found, then we try to start it');
        fs.unlinkSync (pidFile);
        isRunning = false;
      }
    }
  }

  if (!isRunning) {
    var logout = fs.openSync (logFile, 'a');
    var logerr = fs.openSync (logFile, 'a');

    var unpmFork = spawn ('node', [path.resolve (__dirname, './server.js')], {
      detached: true,
      stdio: ['ignore', logout, logerr]
    });

    console.info ('[' + moduleName + '] Info: unpm server PID: ' + unpmFork.pid);
    fs.writeFileSync (pidFile, unpmFork.pid);

    unpmFork.unref ();
  }
};

exports.stop = function () {
  try {
    var pid = fs.readFileSync (pidFile, 'utf8');
    process.kill (pid, 'SIGTERM');
    fs.unlinkSync (pidFile);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error (err);
    }
  }
};

exports.restart = function () {
  exports.stop ();
  exports.start ();
};
