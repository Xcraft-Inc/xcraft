'use strict';

var bootEnv = function ()
{
  var path = require ('path');

  var list = process.env.PATH.split (path.delimiter);
  list.unshift (path.resolve ('./var/devroot/bin/'));
  list.unshift (path.resolve ('./var/devroot/usr/bin/'));
  process.env.PATH = list.join (path.delimiter);
};

module.exports = function ()
{
  bootEnv ();
};
