
var fs   = require ('fs');
var path = require ('path');

exports.cp = function (src, dst)
{
  fs.createReadStream (src).pipe (fs.createWriteStream (dst));
}

exports.mkdir = function (location, root)
{
  var zogPlatform = require ('./zogPlatform.js');

  var dirs = location.split (path.sep);
  var dir  = dirs.shift ();
  var root = (root || '') + dir + path.sep;

  try
  {
    fs.mkdirSync (root);
  }
  catch (err)
  {
    if (!fs.statSync (root).isDirectory ())
      throw new Error (err);
  }

  return !dirs.length || this.mkdir (dirs.join (path.sep), root);
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
