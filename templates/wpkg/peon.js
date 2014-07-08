#!/usr/bin/env node

var moduleName = 'peon';

var action = function ()
{
  var fs      = require ('fs');
  var url     = require ('url');
  var path    = require ('path');
  var zogHttp = require ('zogHttp');

  var config = require ('./config.json');

  return {
    install: function ()
    {
      /* Looks if there is something to get and save the result in a cache/
       * directory.
       */
      if (config.uri.length)
      {
        var urlObj = url.parse (config.uri);

        if (/http[s]?:/.test (urlObj.protocol))
        {
          var outputFile = path.join (__dirname, 'cache', path.basename (urlObj.pathname));

          console.log ('download %s to %s', config.uri, outputFile);
          zogHttp.get (config.uri, outputFile);
        }
      }

      switch (config.type)
      {
      case 'bin':
        break;

      default:
        break;
      }
    },

    remove: function ()
    {

    }
  }
}

var main = new action ();

if (process.argv.length >= 3)
{
  console.log ('run the action: ' + process.argv[2]);
  main[process.argv[2]] ();
}
