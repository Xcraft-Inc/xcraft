require ('./main.less');
var ipc               = require ('ipc');
var React             = require ('react');
var xCraftMaterials   = require ('xcraft-materials');


var actions            = xCraftMaterials.ComponentsActions;
var toggleActivityList = actions.toggleActivityList;

var Appspace     = xCraftMaterials.Appspace;
var Workspace     = xCraftMaterials.Workspace;
var Titlebar      = xCraftMaterials.Titlebar;
var ActivityList  = xCraftMaterials.ActivityList;
var PackageList  = xCraftMaterials.PackageList;

var Lokthar       = React.createClass ({
  getInitialState: function () {
    return {isMaximized: false};
  },

  render: function () {
    return (
      <Appspace>
        <Titlebar
          title="Lokthar"
          isMaximized={this.state.isMaximized}
          menuAction={this._toggleActivityList}
          closeAction={this._close}
          minimizeAction={this._minimize}
          maximizeAction={this._maximize} />
        <ActivityList />
        <Workspace name="main">
        </Workspace>
      </Appspace>
    );
  },

  _toggleActivityList: function () {
    toggleActivityList ();
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

module.exports = Lokthar;
