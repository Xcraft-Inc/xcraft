
var moduleName = 'http';

var fs   = require ('fs');
var path = require ('path');

var zogLog = require ('../lib/zogLog.js') (moduleName);

exports.get = function (fileUrl, outputFile)
{
  var http  = require ('http');
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
    });

    res.on ('end', function ()
    {
      file.end ();
    });
  });
}

exports.post = function (inputFile, server, port, urlPath)
{
  var protocol = port == 443 ? 'https' : 'http';
  var progress = require ('progress');
  var progressStream = require ('progress-stream');
  var request = require ('request');

  var length = fs.statSync (inputFile).size;
  var remoteUri = protocol + '://' + server + ':' + port;
  var options =
  {
    uri: remoteUri + urlPath,
    method: 'POST',
    strictSSL: false,
    headers:
    {
      'Content-Type': 'application/octet-stream',
      'Content-Length': length.toString (),
      'Transfer-Encoding': 'chunked',
      'Zog-Upload-Filename': path.basename (inputFile)
    }
  };

  var bar = new progress ('                 uploading [:bar] :percent :etas',
  {
    complete: '=',
    incomplete: ' ',
    width: 40,
    total: length,
    stream: process.stdout
  });

  var socket = require ('socket.io-client') (remoteUri, { reconnection: false });

  socket.on ('connect', function ()
  {
    zogLog.verb ('connected to the chest server');

    /* We inform the server that we will upload something. */
    socket.emit ('register', path.basename (inputFile));

    socket.on ('disconnect', function ()
    {
      bar.terminate ();
      zogLog.verb ('disconnected from the chest server');
    });

    /* It is the server acknowledge. */
    socket.on ('registered', function (error)
    {
      /* It happens when a file with the same name is already uploaded by
       * someone else.
       */
      if (error)
      {
        zogLog.err (error);
        return;
      }

      zogLog.info ('begin file upload');

      var progressCalc = progressStream ({ length: length });

      progressCalc.on ('progress', function (progress)
      {
        bar.tick (progress.delta);
      });

      var stream = fs.createReadStream (inputFile);

      var reqFile = request (options, function (error, response, body)
      {
        if (error)
          zogLog.err ('problem with request: ' + error);

        if (body)
          zogLog.verb (body);
      });

      stream.on ('end', function ()
      {
        zogLog.verb ('end of the POST request');
      });

      /* Send the file to the server. */
      stream.pipe (progressCalc).pipe (reqFile);
    });
  });
}
