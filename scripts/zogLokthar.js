
var moduleName = 'lokthar';

var fs          = require ('fs');
var sys         = require ('sys');
var path        = require ('path');
var exec        = require ('child_process').exec;
var zogConfig   = require ('./zogConfig.js');
var zogPlatform = require ('./lib/zogPlatform.js');
var zogLog      = require ('./lib/zogLog.js')(moduleName);

var buildDir      = path.join (zogConfig.loktharRoot, '/build/');
var atomDir       = path.join (zogConfig.loktharRoot, '/build/atom-shell/');
var loktharAppDir = path.join (zogConfig.loktharRoot, '/lokthar-app');

var gruntBin = {};
var cmd = {};


var build = function ()
{
  exec ('npm install --prefix ' + buildDir + ' ' + buildDir, function (error, stdout, stderr)
  {
    zogLog.verb ('build lokthar outputs:\n' + stdout);

    if (error === null)
      grunt ();
    else
      zogLog.err ('unable to build lokthar\n' + stderr);
  });
}

var grunt = function ()
{
  var gruntfile = path.join (buildDir, 'gruntfile.js');
  exec ('node ' + gruntBin + ' --gruntfile ' + gruntfile + ' download-atom-shell', function (error, stdout, stderr)
  {
    zogLog.verb ('grunt lokthar outputs:\n' + stdout);

    var atom = path.join (atomDir, 'atom' + zogPlatform.getExecExt ());
    // chmod +x flag to atom for Unix, ignored on Windows.
    fs.chmodSync (atom, 0755);

    if (error)
      zogLog.err ('unable to grunt lokthar\n' + stderr);
  });
}

cmd.run = function ()
{
  var atom = path.join (atomDir, 'atom' + zogPlatform.getExecExt ());
  exec (atom + ' ' + loktharAppDir, function (error, stdout, stderr)
  {
    zogLog.verb ('atom outputs:\n' + stdout);

    if (error === null)
    {

    }
    else
      zogLog.err ('unable to exec atom\n' + stderr);
  });
}

cmd.install = function ()
{
  try
  {
    gruntBin = path.join (zogConfig.nodeModulesRoot, '/grunt-cli/bin/grunt');
    build ();
  }
  catch (err)
  {
    zogLog.err (err);
  }
}

cmd.uninstall = function ()
{
  zogLog.warn ('the uninstall action is not implemented');
}

exports.args = function ()
{
  var list = [];

  Object.keys (cmd).forEach (function (action)
  {
    list.push (action);
  });

  return list;
}

exports.action = function (act)
{
  zogLog.info ('run action ' + act);

  try
  {
    cmd[act] ();
  }
  catch (err)
  {
    zogLog.err (err);
  }
}
