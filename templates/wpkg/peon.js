#!/usr/bin/env node
'use strict';

var moduleName = 'peon';

var action = function ()
{
  var fs      = require ('fs');
  var url     = require ('url');
  var path    = require ('path');
  var zogHttp = require ('zogHttp');

  var config = require ('./config.json');

  var runOrCopy = function (file)
  {
    switch (config.type)
    {
    case 'bin':
      break;

    default:
      break;
    }
  };

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
          var lastProgress = -1;
          var outputFile = path.join (__dirname, 'cache', path.basename (urlObj.pathname));

          console.log ('download %s to %s', config.uri, outputFile);
          zogHttp.get (config.uri, outputFile, function ()
          {
            runOrCopy (outputFile);
          }, function (progress, total)
          {
            var currentProgress = parseInt (progress / total * 100);
            if (currentProgress != lastProgress)
            {
              lastProgress = currentProgress;
              /* Like '%3s' */
              var strProgress = Array (4 - lastProgress.toString ().length).join (' ') + lastProgress;
              var screenProgress = parseInt (lastProgress * 40 / 100);
              console.log ('%s%% [%s%s]',
                           strProgress,
                           Array (screenProgress + 1).join ('='),
                           Array (40 - screenProgress + 1).join (' '));
            }
          });
        }

        /* TODO: handle the case without http[s]. */
      }

      /* TODO: handle the case without URI. */
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
