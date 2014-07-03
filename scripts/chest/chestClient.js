
var moduleName = 'chest';

var zogConfig = require ('../zogConfig.js') ();
var zogLog    = require ('zogLog') (moduleName);

var chestUpload = function (inputFile, server, port)
{
  var fs             = require ('fs');
  var path           = require ('path');
  var request        = require ('request');
  var progress       = require ('progress');
  var progressStream = require ('progress-stream');

  var protocol = port == 443 ? 'https' : 'http';
  var length = fs.statSync (inputFile).size;
  var remoteUri = protocol + '://' + server + ':' + port;
  var options =
  {
    uri: remoteUri + '/upload',
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

  var bar = new progress ('                  uploading [:bar] :percent :etas',
  {
    complete: '=',
    incomplete: ' ',
    width: 40,
    total: length,
    stream: process.stdout
  });
  var progressSpeed = 0;

  /* FIXME: it should be a socket.io-client option. */
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  var socket = require ('socket.io-client') (remoteUri,
  {
    reconnection: false
  });

  socket.on ('connect', function ()
  {
    zogLog.verb ('connected to the chest server');

    /* We inform the server that we will upload something. */
    socket.emit ('register', path.basename (inputFile));

    socket.on ('disconnect', function ()
    {
      if (!bar.complete)
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
        progressSpeed = (progressSpeed + progress.speed) / 2;
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
        zogLog.info ('transfer average speed: %d [Mbps]',
                     parseInt (progressSpeed * 8 / 1000) / 1000);
        zogLog.info ('the uploaded file is synchronizing in the repository...');
      });

      /* Send the file to the server. */
      stream.pipe (progressCalc).pipe (reqFile);
    });
  });

  socket.on ('connect_error', function (error)
  {
    zogLog.err (error);
  });
}

exports.upload = function (file)
{
  try
  {
    chestUpload (file,
                 zogConfig.chest.host,
                 zogConfig.chest.port);
  }
  catch (err)
  {
    zogLog.err (err.message);
  }
}
