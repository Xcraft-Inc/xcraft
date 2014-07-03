
exports.getOs = function ()
{
  return /^win/.test (process.platform) ? 'win' : 'unix';
}

exports.getExecExt = function ()
{
  return /^win/.test (process.platform) ? '.exe' : '';
}

exports.getShellExt = function ()
{
  return /^win/.test (process.platform) ? '.bat' : '';
}
