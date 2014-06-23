
var moduleName = 'chest';

var fs        = require ('fs');
var path      = require ('path');
var express   = require ('express')();
var zogConfig = require ('../zogConfig.js');
var zogLog    = require ('../lib/zogLog.js')(moduleName);

express.listen (zogConfig.chestServerPort);

express.post ('/upload', function (req, res)
{
  var repoFile = path.join (zogConfig.chestServerRepo, req.headers['zog-upload-filename'])
  var wstream = fs.createWriteStream (repoFile);

  req.on ('data', function (data)
  {
    wstream.write (data);
  });

  req.on ('end', function ()
  {
    wstream.end ();
    res.end ("end of file transfer");
  });

  req.on ('error', function (err)
  {
    zogLog.err (err.message);
  });
});
