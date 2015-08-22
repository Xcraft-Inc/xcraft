'use strict';

var moduleName = 'devel';

var fs   = require ('fs');
var path = require ('path');

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

exports.autoPatch = function (patchesDir, srcDir, callback) {
  var async = require ('async');

  if (!fs.existsSync (patchesDir)) {
    callback ();
    return;
  }

  var xFs       = require ('xcraft-core-fs');
  var xDevel    = require ('xcraft-core-devel');
  var xPlatform = require ('xcraft-core-platform');

  var list = xFs.ls (patchesDir, new RegExp ('^(?:[0-9]+|' +  xPlatform.getOs () + '-).*.(?:patch|diff)$'));

  if (!list.length) {
    callback ();
    return;
  }

  async.eachSeries (list, function (file, callback) {
    xLog.info ('apply patch %s in %s', file, srcDir);
    var patchFile = path.join (patchesDir, file);

    xDevel.patch (srcDir, patchFile, 0, function (err) {
      callback (err ? 'patch failed: ' + file + ' ' + err : null);
    });
  }, function (err) {
    callback (err);
  });
};
