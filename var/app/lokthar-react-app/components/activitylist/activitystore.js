var Reflux            = require ('reflux');
var actions           = require ('../../actions/xcraftActions.js');
var activityStarted   = actions.activityStarted;


var activityStore   = Reflux.createStore({
  activities: [],

  init: function () {
    this.listenTo(activityStarted, this.handleStarted);
  },

  handleStarted: function (msg) {
    console.log ('user started a new activity');
    this.activities.push ({activityId: msg.id, text: msg.cmd})
    this.trigger(activities);
  }

});

module.exports = activityStore;
