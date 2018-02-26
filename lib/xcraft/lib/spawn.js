'use strict';

var spawn = require('child_process').spawn;

exports.run = function(bin, args, callback, callbackStdout) {
  var ext = /^win/.test(process.platform) ? '.cmd' : '';
  bin += ext;

  var cmd = spawn(bin, args);

  cmd.stdout.on('data', function(data) {
    data
      .toString()
      .replace(/\r/g, '')
      .split('\n')
      .forEach(function(line) {
        if (line.trim().length) {
          if (callbackStdout) {
            callbackStdout(line);
          } else {
            console.log(line);
          }
        }
      });
  });

  cmd.stderr.on('data', function(data) {
    data
      .toString()
      .replace(/\r/g, '')
      .split('\n')
      .forEach(function(line) {
        if (line.trim().length) {
          console.log(line);
        }
      });
  });

  cmd.on('error', function(data) {
    if (callback) {
      callback(data);
    }
  });

  cmd.on('close', function(code) {
    /* jshint ignore:line */
    if (callback) {
      callback();
    }
  });
};
