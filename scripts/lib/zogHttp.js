
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
  var protocol = port === 443 ? 'https' : 'http';
  var http = require (protocol);
  var progress = require ('progress');

  var length = fs.statSync (inputFile).size;
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

  var socket = require ('socket.io-client') (protocol + '://' + server + ':' + port);

  socket.on ('connect', function ()
  {
    var total = 0;

    zogLog.verb ('connected to the chest server');

    /* We inform the server that we will upload something. */
    socket.emit ('register', path.basename (inputFile));

    socket.on ('disconnect', function ()
    {
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

      var stream = fs.createReadStream (inputFile);

      /* The chest server sends the data.length that are saved on its side.
       * Then it is possible to slow down the reader othwerwise the javascript
       * garbage collector will use a lot of memory in order to store the
       * stream (like very large files of several gigabytes).
       * The server emit the 'received' signal for each chunk of data.
       */
      socket.on ('received', function (data)
      {
        /* We pause the stream only when the reader is 1.2x faster than the
         * server.
         */
        if (total / data > 1.2)
          stream.pause ();
        else
          stream.resume ();
      });

      var request = http.request (options, function (res)
      {
        var body = '';

        res.on ('data', function (chunk)
        {
          body += chunk;
        });

        res.on ('end', function ()
        {
          zogLog.verb (body);
        });

        res.on ('error', function (err)
        {
          zogLog.err ('problem with request: ' + err.message);
        });
      });

      request.on ('error', function (err)
      {
        zogLog.err ('problem with request: ' + err.message);
      });

      /* Send the data to the chest server. */
      stream.on ('data', function (chunk)
      {
        request.write (chunk);
        total += chunk.length;
        bar.tick (chunk.length);
      });

      stream.on ('end', function ()
      {
        zogLog.verb ('end of the POST request');
        request.end ();
      });
    });
  });
}
