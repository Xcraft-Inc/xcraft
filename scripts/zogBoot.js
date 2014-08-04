'use strict';

var zogConfig = require ('./zogConfig.js') ();

var bootEnv = function ()
{
  var path = require ('path');
  var fs   = require ('fs');

  var list = process.env.PATH.split (path.delimiter);
  list.unshift (path.resolve ('./var/devroot/bin/'));
  list.unshift (path.resolve ('./var/devroot/usr/bin/'));

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

  process.env.PATH = list.join (path.delimiter);
};

module.exports = function ()
{
  bootEnv ();
};
