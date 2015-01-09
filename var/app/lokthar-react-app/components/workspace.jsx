var React      = require ('react');
var mui        = require ('material-ui');
var Classable  = mui.Mixins.Classable;

var AppCanvas    = mui.AppCanvas;

var Workspace    = React.createClass ({

  mixins: [Classable],

  propTypes: {
    name: React.PropTypes.string,
    layout: React.PropTypes.number
  },

  render: function () {
    var classes = this.getClasses({
      'mui-app-content-canvas': this.props.layout === 0
    });
    return (
      <AppCanvas predefinedLayout={this.props.layout}>
        <div className={classes}>
          {this.props.children}
        </div>
      </AppCanvas>
    );
  }

});

module.exports = Workspace;
