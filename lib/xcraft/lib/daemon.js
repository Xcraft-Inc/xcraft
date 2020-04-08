'use strict';

var moduleName = 'daemon';

var fs = require('fs');
var spawn = require('child_process').spawn;

module.exports = function (serverName, serverScript, detached) {
  var pidFile = './var/run/' + serverName + 'd.pid';
  var logFile = './var/log/' + serverName + 'd.log';

  return {
    start: function () {
      var isRunning = false;
      if (fs.existsSync(pidFile)) {
        console.warn(
          '[' +
            moduleName +
            '] Warn: the ' +
            serverName +
            ' server seems running'
        );

        isRunning = true;
        var pid = fs.readFileSync(pidFile, 'utf8');

        try {
          process.kill(pid, 0);
        } catch (err) {
          if (err.code === 'ESRCH') {
            console.warn(
              '[' +
                moduleName +
                '] Warn: but the process can not be found, then we try to start it'
            );
            fs.unlinkSync(pidFile);
            isRunning = false;
          }
        }
      }

      if (!isRunning) {
        var options = {
          detached: detached,
        };

        if (detached) {
          var logout = fs.openSync(logFile, 'a');
          var logerr = fs.openSync(logFile, 'a');

          options.stdio = ['ignore', logout, logerr];
        }

        var fork = spawn('node', [serverScript], options);

        console.info(
          '[' +
            moduleName +
            '] Info: ' +
            serverName +
            ' server PID: ' +
            fork.pid
        );
        fs.writeFileSync(pidFile, fork.pid);

        fork.unref();
      }
    },

    stop: function () {
      try {
        var pid = fs.readFileSync(pidFile, 'utf8');
        process.kill(pid, 'SIGTERM');
        fs.unlinkSync(pidFile);
      } catch (err) {
        if (err.code !== 'ENOENT') {
          console.error(err);
        }
      }
    },

    restart: function () {
      this.stop();
      this.start();
    },
  };
};
