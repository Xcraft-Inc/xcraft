var React      = require ('react');
var mui        = require ('material-ui');

var Classable    = mui.Mixins.Classable;
var AppBar       = mui.AppBar;
var FlatButton   = mui.FlatButton;
var IButton      = mui.IconButton;
var Toolbar      = mui.Toolbar;
var ToolbarGroup = mui.ToolbarGroup;
var Titlebar     = React.createClass ({

  mixins: [Classable],

  propTypes: {
    title: React.PropTypes.string,
    isMaximized: React.PropTypes.bool,
    minimizeAction: React.PropTypes.func,
    maximizeAction: React.PropTypes.func,
    closeAction: React.PropTypes.func
  },

  render: function () {
    var maximizeIcon = this.props.isMaximized ? 'navigation-fullscreen-exit' : 'navigation-fullscreen';
    var maximizeTip = this.props.isMaximized ? 'Exit fullscreen' : 'Fullscreen';
    return (
      <AppBar title={this.props.title}>
        <IButton className="xc-titlebar-actions" icon="navigation-close" tooltip="Exit" onTouchTap={this._handleCloseTouchTap} />
        <IButton className="xc-titlebar-actions" icon={maximizeIcon} tooltip={maximizeTip} onTouchTap={this._handleMaximizeTouchTap} />
        <IButton className="xc-titlebar-actions" icon="navigation-expand-more" tooltip="Minimize" onTouchTap={this._handleMiminizeTouchTap} />
      </AppBar>
    );
  },

  _handleCloseTouchTap: function() {
    if (this.props.closeAction) {
      this.props.closeAction ();
    }
  },

  _handleMiminizeTouchTap: function() {
    if (this.props.minimizeAction) {
      this.props.minimizeAction ();
    }
  },

  _handleMaximizeTouchTap: function() {
    if (this.props.maximizeAction) {
      this.props.maximizeAction ();
    }
  }

});

module.exports = Titlebar;
