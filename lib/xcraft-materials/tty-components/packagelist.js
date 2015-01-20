var packagesStore  = require ('../stores/packagesstore.js');
var util           = require ('util');

module.exports = function () {
  packagesStore.listen(function (list) {
    var header = util.format ('name%s version%s architectures',
    new Array (40 - 'name'.length).join (' '),
    new Array (15 - 'version'.length).join (' '));
    console.log (header);
    console.log (new Array (header.length + 1).join ('-'));

    list.forEach (function (def) {
      var version = def.version.toString ();
      if (def.version.toString ().length > 14) {
        version = version.substr (0, 11) + '...';
      }

      console.log ('%s%s %s%s',
      def.name,
      new Array (40 - def.name.length).join (' '),
      version,
      new Array (15 - version.length).join (' '),
      def.architecture.join (', '));
    });
  });
};
