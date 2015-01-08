var React      = require ('react');
var Reflux     = require ('reflux');
var _          = require ('lodash');
var mui        = require ('material-ui');
var MenuItem   = mui.MenuItem;
var LeftNav    = mui.LeftNav;

var activityStore      = require ('./activitystore.js');
var componentsActions  = require ('../../actions/componentsActions.js');
var toggleActivityList = componentsActions.toggleActivityList;

var commands           = require ('../../actions/xcraftCommands.js');
var pacmanList         = commands.pacmanList;
var headerActivities   = [
  {type: MenuItem.Types.SUBHEADER, text: 'Availables:'},
  {text: 'List packages', cmd: 'pacmanList'},
  {type: MenuItem.Types.SUBHEADER, text: 'Currents:'}
];

var ActivityList       = React.createClass ({

  mixins: [Reflux.ListenerMixin],

  propTypes: {
    name: React.PropTypes.string
  },

  getInitialState: function () {
    return {activities: headerActivities};
  },

  onActivityChange: function(newActivities) {
    var activities = _.union (headerActivities, newActivities);
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
      commands[activity.cmd] ();
      return;
    }
  }

});

module.exports = ActivityList;
