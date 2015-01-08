var Reflux            = require ('reflux');
var events            = require ('../../actions/xcraftEvents.js');
var activityStarted   = events.activityStarted;

var activityStore   = Reflux.createStore({
  activities: [],

  init: function () {
    this.listenTo(activityStarted, this.handleStarted);
  },

  handleStarted: function (msg) {
    console.log ('user started a new activity');
    if (msg.id) {
      this.activities.push ({activityId: msg.id, text: msg.cmd});
    }
    this.trigger(this.activities);
  }

});

module.exports = activityStore;
