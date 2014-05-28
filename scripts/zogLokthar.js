
var fs          = require ('fs');
var sys         = require ('sys');
var path        = require ('path');
var exec        = require ('child_process').exec;
var zogPlatform = require ('./lib/zogPlatform');

var package = 'lokthar';

var buildDir      = path.join (__dirname, '../lokthar/build/');
var atomDir       = path.join (__dirname, '../lokthar/build/atom-shell/');
var loktharAppDir = path.join (__dirname, '../lokthar/lokthar-app');

var gruntBin = {};
var cmd = {};


var build = function ()
{
  exec ('npm install --prefix ' + buildDir + ' ' + buildDir, function (error, stdout, stderr)
  {
    sys.puts (stdout);
    if (error === null)
      grunt ();
    else
      sys.puts (stderr);
  });
}

var grunt = function ()
{
  var gruntfile = path.join (buildDir, 'gruntfile.js');
  exec ('node ' + gruntBin + ' --gruntfile ' + gruntfile + ' download-atom-shell', function (error, stdout, stderr)
  {
    sys.puts (stdout);
    if (error === null)
    {
      var atom = path.join (atomDir, 'atom' + zogPlatform.getExecExt ());
      /* chmod +x flag to atom for Unix, ignored on Windows. */
      fs.chmodSync (atom, 0755);
    }
    else
      sys.puts (stderr);
  });
}

cmd.run = function ()
{
  var atom = path.join (atomDir, 'atom' + zogPlatform.getExecExt ());
  exec (atom + ' ' + loktharAppDir, function (error, stdout, stderr)
  {
    sys.puts (stdout);
    if (error === null)
    {
      
    }
    else
      sys.puts (stderr);
  });
}

cmd.install = function ()
{
  try
  {
    exec ('npm install grunt-cli', function (error, stdout, stderr)
    {
      sys.puts (stdout);
      if (error === null)
      {
        gruntBin = path.join (__dirname, '../node_modules/grunt-cli/bin/grunt');
        build ();
      }
      else
        sys.puts (stderr);
    });
  }
  catch (err)
  {
    console.log ('[' + package + '] ' + err);
  }
}

cmd.uninstall = function ()
{
  
}

exports.action = function (act)
{
  console.log ('[' + package + '] ' + act);

  try
  {
    cmd[act] ();
  }
  catch (err)
  {
    console.log ('[' + package + '] ' + err);
  }
}
