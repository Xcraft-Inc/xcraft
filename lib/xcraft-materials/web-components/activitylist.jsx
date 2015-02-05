var React      = require ('react');
var Reflux     = require ('reflux');
var Router     = require ('react-router');
var _          = require ('lodash');
var mui        = require ('material-ui');
var MenuItem   = mui.MenuItem;
var LeftNav    = mui.LeftNav;

var activityStore      = Reflux.createStore(require ('../stores/activitystore.js')('web'));
var componentsActions  = require ('../actions/webComponentsActions.js');
var toggleActivityList = componentsActions.toggleActivityList;

var commands           = require ('../actions/xcraftCommands.js');

/* TODO: load available activities */
var headerActivities   = [
  {type: MenuItem.Types.SUBHEADER, text: 'Availables:'},
  {text: 'List packages', cmd: 'pacman.list', route: 'packagelist'},
  {type: MenuItem.Types.SUBHEADER, text: 'Currents:'}
];

var ActivityList       = React.createClass ({

  mixins: [Router.Navigation, Reflux.ListenerMixin],

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
    this.transitionTo(activity.route);
    if (activity.id) {
      /* restore activity case*/
      return;
    }
    if (activity.cmd) {
      /*new activity case*/
      var cmdData = {
        cmd: activity.cmd
      };
      commands.send (cmdData);
      return;
    }
  }

});

module.exports = ActivityList;
