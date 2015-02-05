'use strict';

var moduleName = 'unpm';

var fs    = require ('fs');
var path  = require ('path');
var spawn = require ('child_process').spawn;

var unpmPidFile = './var/run/unpmd.pid';
var unpmLogFile = './var/log/unpmd.log';

exports.start = function () {
  var isRunning = false;
  if (fs.existsSync (unpmPidFile)) {
    console.warn ('[' + moduleName + '] Warn: the unpm server seems running');

    isRunning = true;
    var pid = fs.readFileSync (unpmPidFile, 'utf8');

    try {
      process.kill (pid, 0);
    } catch (err) {
      if (err.code === 'ESRCH') {
        console.warn ('[' + moduleName + '] Warn: but the process can not be found, then we try to start it');
        fs.unlinkSync (unpmPidFile);
        isRunning = false;
      }
    }
  }

  if (!isRunning) {
    var logout = fs.openSync (unpmLogFile, 'a');
    var logerr = fs.openSync (unpmLogFile, 'a');

    var unpmFork = spawn ('node', [path.resolve (__dirname, './server.js')], {
      detached: true,
      stdio: ['ignore', logout, logerr]
    });

    console.info ('[' + moduleName + '] Info: unpm server PID: ' + unpmFork.pid);
    fs.writeFileSync (unpmPidFile, unpmFork.pid);

    unpmFork.unref ();
  }
};

exports.stop = function () {
  try {
    var pid = fs.readFileSync (unpmPidFile, 'utf8');
    process.kill (pid, 'SIGTERM');
    fs.unlinkSync (unpmPidFile);
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
