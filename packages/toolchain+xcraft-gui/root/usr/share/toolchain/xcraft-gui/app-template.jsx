require ('./main.less');
var remote            = require ('remote');
var React             = require ('react');
var xCraftMaterials   = require ('xcraft-materials');


var actions            = xCraftMaterials.ComponentsActions;
var toggleActivityList = actions.toggleActivityList;

var Window        = xCraftMaterials.Window;
var Workspace     = xCraftMaterials.Workspace;
var Titlebar      = xCraftMaterials.Titlebar;
var ActivityList  = xCraftMaterials.ActivityList;
var PackageList   = xCraftMaterials.PackageList;

var Lokthar       = React.createClass ({
  getInitialState: function () {
    return {isMaximized: false};
  },

  render: function () {
    return (
      <Window>
        <Titlebar
          title="xCraft-GUI"
          isMaximized={this.state.isMaximized}
          menuAction={this._toggleActivityList}
          closeAction={this._close}
          minimizeAction={this._minimize}
          maximizeAction={this._maximize} />
        <ActivityList />
        <Workspace name="main">
        </Workspace>
      </Window>
    );
  },

  _toggleActivityList: function () {
    toggleActivityList ();
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

console.log ('windows index: ' + remote.getCurrentWindow().windex);
remote.getCurrentWindow().toggleDevTools();

module.exports = Lokthar;
