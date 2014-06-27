
var moduleName = 'chest';

var zogConfig = require ('../zogConfig.js')();
var zogLog    = require ('../lib/zogLog.js')(moduleName);

exports.upload = function (file)
{
  var zogHttp = require ('../lib/zogHttp.js');

  try
  {
    zogHttp.post (file,
                  zogConfig.chest.host,
                  zogConfig.chest.port,
                  '/upload');
  }
  catch (err)
  {
    zogLog.err (err.message);
  }
}
