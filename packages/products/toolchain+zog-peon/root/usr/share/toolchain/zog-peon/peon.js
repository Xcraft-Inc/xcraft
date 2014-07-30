#!/usr/bin/env node
'use strict';

var moduleName = 'peon';

var action = function (currentDir)
{
  var fs      = require ('fs');
  var url     = require ('url');
  var path    = require ('path');
  var zogPeon = require ('zogPeon');

  var config = require (path.join (currentDir, './config.json'));

  return {
    postinst: function ()
    {
      var extra =
      {
        'bin' : config.rules.bin,
        'args': config.rules.args
      };

      zogPeon[config.type][config.rules.type] (config.uri, null, currentDir, extra, function (done)
      {
        if (!done)
        {
          console.error ('can not %s %s', config.rules.type, config.type);
          process.exit (1);
        }
      });
    },

    prerm: function ()
    {

    }
  }
}

if (process.argv.length >= 4)
{
  var main = new action (process.argv[2]);

  console.log ('run the action: ' + process.argv[3]);
  main[process.argv[3]] ();
}
