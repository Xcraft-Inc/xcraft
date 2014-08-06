'use strict';

var zogConfig = require ('./zogConfig.js') ();
var busBoot   = require (zogConfig.busBoot);
var busClient = require (zogConfig.busClient);
var cmd = {};

var bootEnv = function ()
{
  var path = require ('path');
  var fs   = require ('fs');

  var list = process.env.PATH.split (path.delimiter);

  try
  {
    var zogrc = JSON.parse (fs.readFileSync (zogConfig.zogRc, 'utf8'));
    if (zogrc.hasOwnProperty ('path'))
    {
      zogrc.path.reverse ().forEach (function (location)
      {
        list.unshift (location);
      });
    }
  }
  catch (err)
  {
    if (err.code !== 'ENOENT')
      throw err;
  }

  list.unshift (path.resolve ('./usr/bin'));
  list.unshift (path.join (zogConfig.pkgTargetRoot, 'usr/bin'));
  list.unshift (path.join (zogConfig.pkgTargetRoot, 'bin'));

  process.env.PATH = list.join (path.delimiter);
};



module.exports = function (callbackDone)
{
  bootEnv ();

  busBoot.getEmitter.on('ready', function() {
    busClient.connect (callbackDone);
  });

  busBoot.boot ();
};


busBoot.getEmitter.on('stop', function ()
{
  console.log('zogBoot bus stop');
  busClient.stop ();
});

module.exports.busClient = busClient;
module.exports.bus       = busBoot;
