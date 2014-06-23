
var moduleName = 'http';

var fs   = require ('fs');
var http = require ('http');
var path = require ('path');

var zogLog = require ('../lib/zogLog.js')(moduleName);

exports.get = function (file_url, output_file)
{
  var url   = require ('url');
  var zogFs = require ('./zogFs.js');

  var options =
  {
    host: url.parse (file_url).host,
    port: 80,
    path: url.parse (file_url).pathname
  };

  var output_dir = path.dirname (output_file);
  zogFs.mkdir (output_dir);

  var file_name = url.parse (file_url).pathname.split ('/').pop ();
  var file = fs.createWriteStream (output_file);

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

exports.post = function (inputFile, server, port)
{
  var options =
  {
    hostname: server,
    port    : port,
    path    : '/upload',
    method  : 'POST',
    headers :
    {
      'Content-Type'       : 'application/octet-stream',
      'Content-Length'     : fs.statSync (inputFile).size.toString (),
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
