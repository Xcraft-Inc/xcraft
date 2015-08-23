'use strict';

var reflux         = require ('reflux');
var packagesStore  = reflux.createStore (require ('../stores/packagesstore.js'));

var AsciiTable = require ('ascii-table');

module.exports = function () {
  packagesStore.listen (function (list) {
    var table = new AsciiTable ('List of package definitions');

    table.setHeading ('Name', 'Version', 'Architectures');

    list.forEach (function (def) {
      var version = def.version.toString ();
      table.addRow (def.name, version, def.architecture.join (', '));
    });

    console.log (table.toString ());
  });
};
