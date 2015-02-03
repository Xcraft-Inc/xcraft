require ('./main.less');
var React        = require ('react');
var ipc          = require ('ipc');
var remote       = require ('remote');
var xMat         = require ('xcraft-materials')('web');
var Launcher     = require ('./launcher.jsx');
var Desktop      = React.createClass ({

  mixins: [],

  propTypes: {

  },

  render: function () {
    return (
      <div className="desktop">
        <Launcher menuEntries={this._getEntries ()}/>
        <div className="desktop-version">Xcraft Goblin Desktop 0.1.0</div>
      </div>
    );
  },

  _getEntries: function () {
    /* TODO: var gadgets = require('./gadgetLoader.js'); */
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
