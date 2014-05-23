
var zogPlatform = require ('./lib/zogPlatform');
var sys  = require ('sys');
var path  = require ('path');
var exec = require ('child_process').exec;
var package = 'lokthar';
var buildDir = path.join(__dirname,"../lokthar/build/");
var atomDir = path.join(__dirname,"../lokthar/build/atom-shell/");
var loktharAppDir = path.join(__dirname,"../lokthar/lokthar-app");
var cmd = {};


var build = function ()
{
  console.log(buildDir);
  exec ('npm install --prefix ' + buildDir + ' ' + buildDir, function (error, stdout, stderr) {
    sys.puts (stdout);
      if(error === null)
      {
        grunt();
      }
    });
}

var grunt = function ()
{
  exec ('grunt --gruntfile '+ buildDir + 'gruntfile.js' + ' download-atom-shell', function (error, stdout, stderr) {
    sys.puts (stdout);
      if(error === null)
      {
        
      }
    });
}

cmd.run = function ()
{
  exec (atomDir + 'atom.exe ' + loktharAppDir, function (error, stdout, stderr) {
    sys.puts (stdout);
      if(error === null)
      {
        
      }
    });
}

/**
 * \brief Install the package in /tools.
 */
cmd.install = function ()
{
  try
  {
    exec ('npm install grunt-cli', function (error, stdout, stderr) {
      sys.puts (stdout);
      if(error === null)
      {
        build();
      }
    });
  }
  catch (err)
  {
    console.log ('[' + package + '] ' + err);
  }
}

/**
 * \brief Uninstall the package from /tools.
 */
cmd.uninstall = function ()
{
  
}

/**
 * \brief Actions called from commander with --wpkg.
 */
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
