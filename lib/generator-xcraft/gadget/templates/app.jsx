var remote            = require ('remote');
var React             = require ('react');
var xCraftMaterials   = require ('xcraft-materials')('web');


var actions            = xCraftMaterials.Actions;
var toggleActivityList = actions.toggleActivityList;

var Window        = xCraftMaterials.Window;
var Workspace     = xCraftMaterials.Workspace;
var Titlebar      = xCraftMaterials.Titlebar;
var ActivityList  = xCraftMaterials.ActivityList;
var PackageList   = xCraftMaterials.PackageList;

var App           = React.createClass ({
  getInitialState: function () {
    return {isMaximized: false};
  },

  render: function () {
    return (
      <Window>
        <Titlebar
          title="<%= gadgetName %>"
          isMaximized={this.state.isMaximized}
          menuAction={this._menuClick}
          closeAction={this._close}
          minimizeAction={this._minimize}
          maximizeAction={this._maximize} />
        <Workspace name="main">
        </Workspace>
      </Window>
    );
  },

  _menuClick: function () {
    remote.getCurrentWindow().toggleDevTools();
  },

  _close: function () {
    remote.getCurrentWindow().close();
  },

  _minimize: function () {
    remote.getCurrentWindow().minimize();
  },

  _maximize: function () {
    if (!this.state.isMaximized) {
      remote.getCurrentWindow().maximize();
      this.setState ({isMaximized: true});
    } else {
      remote.getCurrentWindow().unmaximize();
      this.setState ({isMaximized: false});
    }
  }

});


module.exports = App;
