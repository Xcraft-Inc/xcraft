
var mainModuleName = 'zog';

var clc = require ('cli-color');

module.exports = function (module)
{
  var moduleName = module;

  var log = function (level, format)
  {
    var zog = clc.whiteBright.bold (mainModuleName);
    var args = [ zog + ' [%s] %s: ' + format, clc.whiteBright.bold (moduleName), level ];
    args = args.concat (Array.prototype.slice.call (arguments, 2));

    console.log.apply (this, args);
  }

  return {
    verb: function (format)
    {
      var args = [ clc.cyanBright ('Verb') ];
      log.apply (this, args.concat (Array.prototype.slice.call (arguments)));
    },

    info: function (format)
    {
      var args = [ clc.greenBright ('Info') ];
      log.apply (this, args.concat (Array.prototype.slice.call (arguments)));
    },

    warn: function (format)
    {
      var args = [ clc.yellowBright ('Warn') ];
      log.apply (this, args.concat (Array.prototype.slice.call (arguments)));
    },

    err: function (format)
    {
      var args = [ clc.redBright ('Err') ];
      log.apply (this, args.concat (Array.prototype.slice.call (arguments)));
    }
  };
}
