
exports.getOs = function ()
{
  return /^win/.test (process.platform) ? 'win' : 'unix';
}

exports.getExecExt = function ()
{
  return /^win/.test (process.platform) ? '.exe' : '';
}
