
exports.get = function (file_url, output_file)
{
  var fs    = require ('fs');
  var url   = require ('url');
  var http  = require ('http');
  var path  = require ('path');
 
  var zogFs       = require ('./zogFs.js');
  
  var options =
  {
    host: url.parse (file_url).host,
    port: 80,
    path: url.parse (file_url).pathname
  };
  
  var output_dir = path.dirname (output_file);
  zogFs.mkdir (output_dir);

  var file_name = url.parse (file_url).pathname.split ('/').pop ();
  var file = fs.createWriteStream (output_file);

  http.get (options, function (res)
  {
    res.on ('data', function (data)
    {
      file.write (data);
    }).on ('end', function ()
    {
      file.end ();
    });
  });
}
