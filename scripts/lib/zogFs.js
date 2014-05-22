
exports.mkdir = function (path, root)
{
  var fs   = require ('fs');
  var dirs = path.split ('/');
  var dir  = dirs.shift ();
  var root = (root || '') + dir + '/';

  try
  {
    fs.mkdirSync (root);
  }
  catch (err)
  {
    if (!fs.statSync (root).isDirectory ())
      throw new Error (err);
  }

  return !dirs.length || this.mkdir (dirs.join ('/'), root);
}
