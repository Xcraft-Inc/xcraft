var React      = require ('react');
var mui        = require ('material-ui');


var AppCanvas    = mui.AppCanvas;

var Workspace    = React.createClass ({

  propTypes: {
    name: React.PropTypes.string
  },

  render: function () {
    return (
      <AppCanvas predefinedLayout={1}>
        {this.props.children}
      </AppCanvas>
    );
  }

});

module.exports = Workspace;
