require ('./main.less');
var React        = require ('react');
var ipc          = require ('ipc');
var remote       = require ('remote');

var Desktop       = React.createClass ({

  mixins: [],

  propTypes: {

  },

  render: function () {
    return (
      <div className="desktop">
        <input type="button" value="xcraft-gui" onClick={this._startApp} />
        <div className="desktop-version">Goblin desktop 0.1.0</div>
      </div>
    );
  },

  _startApp: function () {
    ipc.send ('start-app', null);
  }

});

remote.getCurrentWindow().toggleDevTools();
module.exports = Desktop;
