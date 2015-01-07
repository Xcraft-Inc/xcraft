var React      = require ('react');
var mui        = require ('material-ui');


var FlatButton   = mui.FlatButton;
var Toolbar      = mui.Toolbar;
var ToolbarGroup = mui.ToolbarGroup;
var Titlebar     = React.createClass ({

  propTypes: {
    title: React.PropTypes.string,
    closeAction: React.PropTypes.func
  },

  render: function () {
    return (
      <Toolbar>
        <ToolbarGroup float="left">
          <h1>{this.props.title}</h1>
        </ToolbarGroup>
        <ToolbarGroup float="right">
          <FlatButton
            key={0}
            label="X"
            primary={true}
            onTouchTap={this._handleCloseTouchTap} />
        </ToolbarGroup>
      </Toolbar>
    );
  },

  _handleCloseTouchTap: function() {
    if (this.props.closeAction) {
      this.props.closeAction ();
    }
  }

});

module.exports = Titlebar;
