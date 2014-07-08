'use strict';

var moduleName = 'chest';

var fs        = require ('fs');
var path      = require ('path');
var express   = require ('express');

var app       = express ();
var server    = require ('http').Server (app);
var zogConfig = require ('../zogConfig.js') ();
var zogFs     = require ('zogFs');
var zogLog    = require ('zogLog') (moduleName);

zogLog.verbosity (0);
zogLog.color (false);
zogLog.datetime (true);

zogLog.verb ('settings:');
zogLog.verb ('- host: ' + zogConfig.chest.host);
zogLog.verb ('- port: ' + zogConfig.chest.port);
zogLog.verb ('- repository: ' + zogConfig.chest.repository);

zogLog.info ('the chest server is listening');

var socketList = [];

app.get ('/', function (req, res)
{
  res.send ('The zog chest server');
});

app.use ('/resources', express.static (zogConfig.chest.repository));

app.post ('/upload', function (req, res)
{
  var file = req.headers['zog-upload-filename'];

  zogFs.mkdir (zogConfig.chest.repository);

  var repoFile = path.join (zogConfig.chest.repository, file);
  var wstream = fs.createWriteStream (repoFile);

  zogLog.info ('start a file upload: %s (%d bytes)',
               file, req.headers['content-length']);

  req.pipe (wstream);

  req.on ('end', function ()
  {
    wstream.end ();
    res.end ("end of file upload");

    /* The transmission is terminated, then we eject the client. */
    socketList[file].disconnect ();
    zogLog.info ('end of file upload: %s', file);
  });

  req.on ('error', function (err)
  {
    if (socketList[file])
      socketList[file].disconnect ();

    zogLog.err (err.message);
  });
});

var io = require ('socket.io') (server);

io.on ('connection', function (socket)
{
  zogLog.verb ('open the connection on the chest server');

  /* Handle the new client connections. */
  socket.on ('register', function (data)
  {
    zogLog.verb ('try to register a new client for ' + data);

    /* Only one client at a time can send a specific file. */
    if (socketList.hasOwnProperty (data))
    {
      zogLog.warn ('a socket is already open for ' + data);

      socket.emit ('registered', 'a socket is already open for ' + data)
      socket.disconnect ();
      return;
    }

    /* Prevent the client that is registered now. */
    socketList[data] = socket;
    socket.emit ('registered');
  });

  socket.on ('disconnect', function ()
  {
    /* Keep sync the file map/socket with the current state.
     * FIXME: this code is not very efficient when many sockets are open.
     */
    Object.keys (socketList).some (function (item)
    {
      if (socketList[item] === socket)
      {
        delete socketList[item];
        return false;
      }
      return true;
    });
  });
});

server.listen (zogConfig.chest.port);
