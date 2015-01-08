require ('./main.less');
var ipc               = require ('ipc');
var React             = require ('react');
var xCraftMaterials   = require ('./xcraft-materials.js');

var Workspace     = xCraftMaterials.Workspace;
var Titlebar      = xCraftMaterials.Titlebar;
var Lokthar       = React.createClass ({
  getInitialState: function () {
    return {isMaximized: false};
  },

  render: function () {
    return (

      <Workspace name="app">
        <Titlebar
          title="Lokthar"
          isMaximized={this.state.isMaximized}
          closeAction={this._close}
          minimizeAction={this._minimize}
          maximizeAction={this._maximize} />
        <Workspace name="main" />
      </Workspace>
    );
  },

  _close: function () {
    ipc.send ('close-app', '');
  },

  _minimize: function () {
    ipc.send ('minimize', '');
  },

  _maximize: function () {
    if (!this.state.isMaximized) {
      ipc.send ('maximize', '');
      this.setState ({isMaximized: true});
    } else {
      ipc.send ('unmaximize', '');
      this.setState ({isMaximized: false});
    }
  }

});


ipc.send('open-console', '');

module.exports = <Lokthar />;
