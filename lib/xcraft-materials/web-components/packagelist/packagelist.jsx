var React      = require ('react');
var Reflux     = require ('reflux');
var mui        = require ('material-ui');
var bootstrap  = require ('react-bootstrap');
var Jumbo      = bootstrap.Jumbotron;
var Panel      = bootstrap.Panel;
var Paper      = mui.Paper;


var packagesStore  = require ('./packagesstore.js');


var PackageList  = React.createClass ({

  mixins: [Reflux.ListenerMixin],

  propTypes: {

  },

  getInitialState: function () {
    return {packages: []};
  },

  componentDidMount: function() {
    this.listenTo(packagesStore, this.onPackagesListChange);
  },

  onPackagesListChange: function(newList) {
    this.setState({
      packages: newList
    });
  },

  render: function () {
    return (
      <Paper zDepth={2}>
        <Jumbo>
          <h1>xCraft Package List</h1>
          {this._renderPackages()}
        </Jumbo>
      </Paper>
    );
  },

  _renderPackages: function () {
    var packages = [];
    var packageItem;
    var itemComponent;
    var headerComponent;

    for (var i=0; i < this.state.packages.length; i++) {
      packageItem = this.state.packages[i];
      headerComponent = (
        <h2>{packageItem.name}</h2>
      );

      itemComponent = (
        <Panel key={i} index={i} header={headerComponent}>
          <p>lore ipsum</p>
        </Panel>
      );
      packages.push (itemComponent);
    }
    return packages;
  }

});

module.exports = PackageList;
