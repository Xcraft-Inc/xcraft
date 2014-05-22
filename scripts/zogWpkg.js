
exports.wpkgManager = function (pkg)
{
  var package = pkg;
  var pkgDir = '../packages/base/';
  var pkgConfig = require (pkgDir + package + '/config.json');

  /**
   * \brief Get the package from an URL.
   */
  this.get = function ()
  {
    var zogPlatform = require ('./lib/zogPlatform');
    var inputFile = pkgConfig.bin[zogPlatform.getOs ()];
    var outputFile = pkgConfig.out;
    
    var zogHttp = require ('./lib/zogHttp.js');
    zogHttp.get (inputFile, outputFile);
  }
  
  /**
   * \brief Install the package in /tools.
   */
  this.install = function ()
  {
    
  }
  
  /**
   * \brief Uninstall the package from /tools.
   */
  this.uninstall = function ()
  {
  
  }
  
  /**
   * \brief Actions called from commander with --wpkg.
   */
  this.action = function (act)
  {
    console.log ('[stage2] [' + package + '] ' + act);
  
    try
    {
      var wpkg = new exports.wpkgManager (package);
      wpkg[act] ();
    }
    catch (err)
    {
      console.log ('[stage2] [' + package + ']: ' + err);
    }
  }
}
