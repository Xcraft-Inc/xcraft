'use strict';

var moduleName = 'devel';

var zogLog = require ('xcraft-core-log') (moduleName);
var fs     = require ('fs');


exports.patch = function (srcDir, patchFile, stripNum, callbackDone) {
  var currentDir = process.cwd ();
  process.chdir (srcDir);

  var spawn = require ('child_process').spawn;
  var patch = spawn ('patch', ['-p' + stripNum]);

  fs.createReadStream (patchFile)
    .on ('data', function (data) {
      patch.stdin.write (data);
    })
    .on ('close', function (code) { /* jshint ignore:line */
      patch.stdin.end ();
    });

  patch.stdout.on ('data', function (data) {
    data.toString ().replace (/\r/g, '').split ('\n').forEach (function (line) {
      if (line.trim ().length) {
        zogLog.verb (line);
      }
    });
  });

  patch.stderr.on ('data', function (data) {
    data.toString ().replace (/\r/g, '').split ('\n').forEach (function (line) {
      if (line.trim ().length) {
        zogLog.err (line);
      }
    });
  });

  patch.on ('close', function (code) {
    process.chdir (currentDir);
    callbackDone (code === 0);
  });
};
