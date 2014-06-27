
var moduleName = 'chest';

var fs        = require ('fs');
var path      = require ('path');
var express   = require ('express')();
var zogConfig = require ('../zogConfig.js') ();
var zogLog    = require ('../lib/zogLog.js') (moduleName);

zogLog.verbosity (0);
zogLog.color (false);
zogLog.datetime (true);

zogLog.verb ('settings:');
zogLog.verb ('  host: ' + zogConfig.chest.host);
zogLog.verb ('  port: ' + zogConfig.chest.port);
zogLog.verb ('  repository: ' + zogConfig.chest.repository);

zogLog.info ('the chest server is listening');

express.listen (zogConfig.chest.port);

express.post ('/upload', function (req, res)
{
  var repoFile = path.join (zogConfig.chest.repository, req.headers['zog-upload-filename'])
  var wstream = fs.createWriteStream (repoFile);

  zogLog.info ('start a file upload: %s (%d bytes)',
               req.headers['zog-upload-filename'],
               req.headers['content-length']);

  req.on ('data', function (data)
  {
    wstream.write (data);
  });

  req.on ('end', function ()
  {
    wstream.end ();
    res.end ("end of file upload");

    zogLog.info ('end of file upload: %s',
                 req.headers['zog-upload-filename']);
  });

  req.on ('error', function (err)
  {
    zogLog.err (err.message);
  });
});
