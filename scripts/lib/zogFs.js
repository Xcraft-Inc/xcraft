
var fs   = require ('fs');
var path = require ('path');

exports.mkdir = function (location, root)
{
  var dirs = location.split ('/');
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

exports.lsdir = function (location)
{
  var listIn = fs.readdirSync (location);
  var listOut = [];

  for (var item in listIn)
  {
    var dir = path.join (location, listIn[item]);
    var st = fs.statSync (dir);
    if (st.isDirectory (dir))
      listOut.push (listIn[item]);
  }

  return listOut;
}
