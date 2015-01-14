var React        = require ('react');
var ipc          = require ('ipc');

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

module.exports = Desktop;
