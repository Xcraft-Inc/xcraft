require ('../less/desktop.less');
var React        = require ('react');
var Reflux       = require ('reflux');
var ipc          = require ('ipc');
var remote       = require ('remote');
var Launcher     = require ('./launcher.jsx');

var gadgetsStore = Reflux.createStore(require ('../stores/gadgetsstore.js'));
var Desktop      = React.createClass ({

  mixins: [],

  propTypes: {
    about: React.PropTypes.string,
  },

  getInitialState: function () {
    return {gadgets: []};
  },

  componentDidMount: function() {
    this.listenTo(gadgetsStore, this.onGadgetsListChange);
  },

  onGadgetsListChange: function(newList) {
    this.setState({
      gadgets: newList
    });
  },

  render: function () {
    return (
      <div className="desktop">
        <Launcher menuEntries={this._getEntries ()}/>
        <div className="desktop-version">{this.props.about}</div>
      </div>
    );
  },

  _getEntries: function () {
    return [
    {
      name: 'Settings',
      icon: 'mdi-action-settings',
      items: [ {
          name: 'Debug',
          icon: 'mdi-action-bug-report',
          action: function () {
            remote.getCurrentWindow().toggleDevTools();
          }
        }
      ]
    },
    {
      name: 'XDK Gadgets',
      icon: 'mdi-hardware-gamepad',
      items: [ {
          name: 'beurk',
          icon: 'mdi-av-web',
          action: function () {}
        }
      ]
    },
    {
      name: 'Packages',
      icon: 'mdi-device-now-widgets',
      items: [ {
          name: 'Manager',
          icon: 'mdi-content-archive',
          action: function () {
            ipc.send ('start-app', null);
          }
        }
      ]
    },
    {
      name: 'Desktop',
      icon: 'mdi-action-aspect-ratio',
      items: [ {
          name: 'Exit',
          icon: 'mdi-action-exit-to-app',
          action: function () {
            ipc.send ('exit', null);
          }
        }
      ]
    }];
  }

});

module.exports = Desktop;
