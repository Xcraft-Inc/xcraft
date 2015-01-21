var React      = require ('react');
var Reflux     = require ('reflux');
var mui        = require ('material-ui');
var bootstrap  = require ('react-bootstrap');
var Jumbo      = bootstrap.Jumbotron;
var Panel      = bootstrap.Panel;
var Paper      = mui.Paper;

var gadgetsStore       = require ('../stores/gadgetsstore.js');
var GadgetList         = React.createClass ({

  mixins: [Reflux.ListenerMixin],

  propTypes: {

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
      <Paper zDepth={2}>
        <Jumbo>
          <h1>Goblin gadgets</h1>
          {this._renderGadgets()}
        </Jumbo>
      </Paper>
    );
  },

  _renderGadgets: function () {
    var gadgets = [];
    var gadgetItem;
    var itemComponent;
    var headerComponent;

    for (var i=0; i < this.state.gadgets.length; i++) {
      gadgetItem = this.state.gadgets[i];
      headerComponent = (
        <h2>{gadgetItem.name}</h2>
      );

      itemComponent = (
        <Panel key={i} index={i} header={headerComponent}>
          <p>lore ipsum</p>
        </Panel>
      );
      gadgets.push (itemComponent);
    }
    return gadgets;
  }

});

module.exports = GadgetList;
