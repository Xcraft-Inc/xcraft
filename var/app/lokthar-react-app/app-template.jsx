require ('./main.less');
var React      = require ('react');
var mui        = require ('material-ui');

var RaisedButton = mui.RaisedButton;
var Lokthar      = React.createClass ({

  render: function () {
    return (
      <p>Lokthar React v0.1.0</p>
    );
  }

});

module.exports = (
  <div>
    <Lokthar />
    <RaisedButton label="Quit" primary={true} />
  </div>
);
