var React        = require ('react');
var Router       = require ('react-router');
var RouteHandler = Router.RouteHandler;
var mui          = require ('material-ui');
var Classable    = mui.Mixins.Classable;

var AppCanvas    = mui.AppCanvas;

var Workspace    = React.createClass ({

  mixins: [Router.State, Classable],

  propTypes: {
    name: React.PropTypes.string
  },

  render: function () {
    return (
      <AppCanvas predefinedLayout={0}>
        <div className="mui-app-content-canvas">
          {this.props.children}
          <RouteHandler />
        </div>
      </AppCanvas>
    );
  }

});

module.exports = Workspace;
