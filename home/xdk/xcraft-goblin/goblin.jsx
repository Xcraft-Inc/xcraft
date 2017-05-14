require ('./main.less');
var React = require ('react');
var ipc = require ('ipc');
var remote = require ('remote');
var xMat = require ('xcraft-materials') ('web');
var Desktop = xMat.Desktop;
var Goblin = React.createClass ({
  mixins: [],

  propTypes: {},

  render: function () {
    return (
      <div>
        <Desktop about="Goblin v0.1.0" />
      </div>
    );
  },
});

module.exports = Goblin;
