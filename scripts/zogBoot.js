'use strict';

var zogConfig = require ('./zogConfig.js') ();

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

module.exports = function ()
{
  bootEnv ();
};
