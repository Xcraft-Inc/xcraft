var React        = require ('react');
var Router       = require ('react-router');
var RouteHandler = Router.RouteHandler;
var mui          = require ('material-ui');
var Classable    = mui.Mixins.Classable;

var AppCanvas    = mui.AppCanvas;

var Window       = React.createClass ({

  mixins: [Classable],

  propTypes: {

  },

  render: function () {
    return (
      <AppCanvas predefinedLayout={1}>
        {this.props.children}
      </AppCanvas>
    );
  }

});

module.exports = Window;
