
var zogConfig = require ('../zogConfig.js')();

exports.upload = function (file)
{
  var zogHttp = require ('../lib/zogHttp.js');
  zogHttp.post (file,
                zogConfig.chest.host,
                zogConfig.chest.port,
                '/upload');
}
