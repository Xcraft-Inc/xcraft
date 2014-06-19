
var mainModuleName = 'zog';
var currentLevel = 1;

var clc = require ('cli-color');

module.exports = function (module)
{
  var moduleName = module;
  var levels =
  [
    clc.cyanBright ('Verb'),
    clc.greenBright ('Info'),
    clc.yellowBright ('Warn'),
    clc.redBright ('Err')
  ];

  var testLevel = function (level)
  {
    return level >= currentLevel;
  }

  var log = function (level, format)
  {
    if (!testLevel (level))
      return;

    var zog = clc.whiteBright.bold (mainModuleName);
    var args = [ zog + ' [%s] %s: ' + format, clc.whiteBright.bold (moduleName), levels[level] ];
    args = args.concat (Array.prototype.slice.call (arguments, 2));

    console.log.apply (this, args);
  }

  return {
    verb: function (format)
    {
      log.apply (this, [ 0 ].concat (Array.prototype.slice.call (arguments)));
    },

    info: function (format)
    {
      log.apply (this, [ 1 ].concat (Array.prototype.slice.call (arguments)));
    },

    warn: function (format)
    {
      log.apply (this, [ 2 ].concat (Array.prototype.slice.call (arguments)));
    },

    err: function (format)
    {
      log.apply (this, [ 3 ].concat (Array.prototype.slice.call (arguments)));
    },

    verbosity: function (level)
    {
      if (level < 0 || level > 3)
        return;
      currentLevel = level;
    }
  };
}
