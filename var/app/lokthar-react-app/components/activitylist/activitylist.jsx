var React      = require ('react');
var Reflux     = require ('reflux');
var mui        = require ('material-ui');
var LeftNav    = mui.LeftNav;
var MenuItem   = mui.MenuItem;

var activityStore      = require ('./activitystore.js');
var componentsActions  = require ('../../actions/componentsActions.js');
var toggleActivityList = componentsActions.toggleActivityList;

var ActivityList  = React.createClass ({

  mixins: [Reflux.ListenerMixin],

  propTypes: {
    name: React.PropTypes.string
  },

  getInitialState: function () {
    return {activities: [
      {text: 'no activity'},
      {type: MenuItem.Types.SUBHEADER, text: 'Availables:'},
      {text: 'List packages', cmd: 'pacman.list'}
    ]};
  },

  onActivityChange: function(activities) {
    this.setState({
      activities: activities
    });
  },

  onToggleActivityList: function() {
    this.refs.activityList.toggle();
  },

  componentDidMount: function() {
    this.listenTo(activityStore, this.onActivityChange);
    this.listenTo(toggleActivityList, this.onToggleActivityList);
  },

  render: function () {
    var header = (<h3>activities</h3>);
    var activities = [];
    if (this.state.activities) {
      activities = this.state.activities;
    }
    return (
      <LeftNav
        ref="activityList"
        header={header}
        docked={false}
        isInitiallyOpen={false}
        onChange={this._onChangeActivity}
        menuItems={activities} />
    );
  },

  _onChangeActivity: function (e, key, activity) {
    if (activity.id) {
      console.log ('restore activity: ' + activity.id);
      return;
    }
    if (activity.cmd) {
      console.log ('start new activity: ' + activity.cmd);
      return;
    }
  }

});

module.exports = ActivityList;
