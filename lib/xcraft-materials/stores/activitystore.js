'use strict';

var reflux = require ('reflux');

module.exports = {
  mixins: [reflux.ListenerMixin],


  eventDependencies: [{
    eventName: 'activityStarted',
    handle: function () {
      this.handleStarted.apply (this, arguments);
    }
  }],

  activities: [],

  init: function () {
    var self = this;
    var events = require ('../actions/xcraftEvents.js');

    this.eventDependencies.forEach (function (dep) {
      var action = events[dep.eventName];
      self.listenTo (action, dep.handle);
    });
  },

  handleStarted: function (msgData) {
    if (msgData.id) {
      this.activities.push ({
        activityId: msgData.id,
        text: msgData.cmd,
        route: 'packagelist'
      });
    }

    this.trigger (this.activities);
  }
};
