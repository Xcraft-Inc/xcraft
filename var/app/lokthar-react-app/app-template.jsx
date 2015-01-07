require ('./main.less');
var ipc               = require ('ipc');
var React             = require ('react');
var xCraftMaterials   = require ('./xcraft-materials.js');

var Titlebar     = xCraftMaterials.Titlebar;
var Lokthar      = React.createClass ({

  render: function () {
    return (
      <div>
        <Titlebar title="Lokthar" closeAction={this._closeLokthar} />
      </div>
    );
  },

  _closeLokthar: function () {
    console.log ('close!');
    ipc.send('close-app', '');
  }

});


ipc.send('open-console', '');

module.exports = <Lokthar />;
