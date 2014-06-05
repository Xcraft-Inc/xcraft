
var clc = require ('cli-color');

var moduleName = {};

var log = function (level, format)
{
  var zog = clc.whiteBright.bold ('zog');
  var args = [ zog + ' [%s] %s: ' + format, clc.whiteBright.bold (moduleName), level ];
  args = args.concat (Array.prototype.slice.call (arguments, 2));

  console.log.apply (this, args);
}

module.exports = function (module)
{
  moduleName = module;

  return {
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
