var React      = require ('react');
var Reflux     = require ('reflux');
var mui        = require ('material-ui');
var bootstrap  = require ('react-bootstrap');
var md5        = require ('xcraft-core-utils').md5;
var Jumbo      = bootstrap.Jumbotron;
var Panel      = bootstrap.Panel;
var Paper      = mui.Paper;


var packagesStore  = require ('../stores/packagesstore.js');


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
        <Jumbo className="jumbotron">
          <h1>Xcraft Packages</h1>
          <p>Manage your packages !</p>
          <p>{this._renderPackages()}</p>
        </Jumbo>
      </Paper>
    );
  },

  _renderPackages: function () {
    var packages = [];
    var packageItem;
    var gravatar;
    var itemComponent;
    var headerComponent;
    var dependenciesComponent;
    var dependencyComponent;

    for (var i=0; i < this.state.packages.length; i++) {
      packageItem = this.state.packages[i];

      headerComponent = (
        <h2>
          <i className="mdi-action-settings"></i> {packageItem.name}
        </h2>
      );

      gravatar = 'http://www.gravatar.com/avatar/' + md5 (packageItem
        .maintainer
        .email
        .trim()
        .toLowerCase());

        dependenciesComponent = [];
        if (Object.keys (packageItem.dependency).length === 0) {
          dependenciesComponent.push (
            <h6 className="list-group-item-text"> No deps.</h6>
          );
        } else {
          Object.keys (packageItem.dependency).forEach ( function (dep) {
            dependencyComponent = (
              <h6 className="list-group-item-text">
                <span className="label label-info">{dep}</span>
              </h6>
            );
            dependenciesComponent.push (dependencyComponent);
          });
        }

        itemComponent = (
          <Panel key={i} index={i} header={headerComponent}>
            <div className="list-group">
              <div className="list-group-item">
                <div className="row-picture">
                  <img className="circle" src={gravatar} alt="icon" />
                </div>
                <div className="row-content">
                  <div className="least-content"><b>v{packageItem.version}</b></div>
                  <h5 className="list-group-item-heading">{packageItem.description.brief}</h5>
                  <p className="list-group-item-text">{packageItem.description.long}</p>
                  <h6 className="list-group-item-heading">Maintainer:</h6>
                  <p className="list-group-item-text">{packageItem.maintainer.name}</p>
                  <h6 className="list-group-item-heading text-success">Dependencies:</h6>
                  {dependenciesComponent}
                </div>
              </div>
            </div>
          </Panel>
        );
        packages.push (itemComponent);
      }
      return packages;
    }

  });

  module.exports = PackageList;
  
