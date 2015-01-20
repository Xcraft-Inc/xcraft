'use strict';

var Reflux            = require ('reflux');
var events            = require ('../actions/xcraftEvents.js');
var activityStarted   = events.activityStarted;

var activityStore   = Reflux.createStore({

  mixins: [Reflux.ListenerMixin],

  activities: [],

  init: function () {
    this.listenTo(activityStarted, this.handleStarted);
  },

  handleStarted: function (msgData) {
    if (msgData.id) {
      this.activities.push ({activityId: msgData.id, text: msgData.cmd, route: 'packagelist'});
    }
    this.trigger(this.activities);
  }

});

module.exports = activityStore;
