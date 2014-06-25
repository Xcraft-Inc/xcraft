
var moduleName = 'http';

var fs   = require ('fs');
var http = require ('http');
var path = require ('path');

var zogLog = require ('../lib/zogLog.js')(moduleName);

exports.get = function (fileUrl, outputFile)
{
  var url   = require ('url');
  var zogFs = require ('./zogFs.js');

  var options =
  {
    host: url.parse (fileUrl).host,
    port: 80,
    path: url.parse (fileUrl).pathname
  };

  zogFs.mkdir (path.dirname (outputFile));

  var file = fs.createWriteStream (outputFile);

  http.get (options, function (res)
  {
    res.on ('data', function (data)
    {
      file.write (data);
    }).on ('end', function ()
    {
      file.end ();
    });
  });
}

exports.post = function (inputFile, server, port, urlPath)
{
  var options =
  {
    hostname: server,
    port: port,
    path: urlPath,
    method: 'POST',
    rejectUnauthorized: false,
    headers:
    {
      'Content-Type': 'application/octet-stream',
      'Content-Length': fs.statSync (inputFile).size.toString (),
      'Zog-Upload-Filename': path.basename (inputFile)
    }
  };

  var request = http.request (options, function (res)
  {
    var body = '';

    res.on ('data', function (chunk)
    {
      body += chunk;
    }).on ('end', function ()
    {
      zogLog.verb (body);
    }).on ('error', function (err)
    {
      zogLog.err ('problem with request: ' + err.message);
    });
  }).on ('error', function (err)
  {
    zogLog.err ('problem with request: ' + err.message);
  });

  var stream = fs.createReadStream (inputFile);

  stream.on ('data', function (data)
  {
    request.write (data);
  }).on ('end', function ()
  {
    zogLog.verb ('end of http POST request');
    request.end ();
  })
}
