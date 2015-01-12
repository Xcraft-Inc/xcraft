'use strict';

var moduleName = 'xcraft-atom';

var fs     = require ('fs');
var path   = require ('path');
var exec   = require ('child_process').exec;


var xLog      = require ('xcraft-core-log')(moduleName);
var xPlatform = require ('xcraft-core-platform');

var buildDir      = __dirname;
var atomDir       = path.join (buildDir, './atom-shell/');


var binGrunt = path.join (__dirname, 'node_modules/.bin/grunt' + xPlatform.getCmdExt ());
var gruntfile = path.join (buildDir, 'gruntfile.js');
var cmd = binGrunt + ' --gruntfile ' + gruntfile + ' download-atom-shell';

exec (cmd, function (error, stdout, stderr) {
  xLog.verb ('xcraft-atom grunt outputs:\n' + stdout);

  var atom = path.join (atomDir, 'atom' + xPlatform.getExecExt ());
  /* chmod +x flag to atom for Unix, ignored on Windows. */
  fs.chmodSync (atom, 493 /* 0755 */);

  if (error) {
    xLog.err ('unable to grunt lokthar\n' + stderr);
  }
});
