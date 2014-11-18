'use strict';

var moduleName = 'devel';

var fs = require ('fs');

var xLog = require ('xcraft-core-log') (moduleName);


exports.patch = function (srcDir, patchFile, stripNum, callback) {
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
        xLog.verb (line);
      }
    });
  });

  patch.stderr.on ('data', function (data) {
    data.toString ().replace (/\r/g, '').split ('\n').forEach (function (line) {
      if (line.trim ().length) {
        xLog.err (line);
      }
    });
  });

  patch.on ('close', function (code) {
    process.chdir (currentDir);
    callback (code === 0 ? null : 'rc: ' + code);
  });
};
