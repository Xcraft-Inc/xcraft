'use strict';

var reflux = require ('reflux');

module.exports = {
  mixins: [reflux.ListenerMixin],

  eventDependencies: [{
    eventName: 'pacmanList',
    handle: function () {
      this.handlePackageList.apply (this, arguments);
    }
  }],

  init: function () {
    var self = this;
    var events      = require ('../actions/xcraftEvents.js');

    this.eventDependencies.forEach (function (dep) {
      var action = events[dep.eventName];
      self.listenTo (action, dep.handle);
    });
  },

  handlePackageList: function (msgData) {
    this.trigger (msgData);
  }
};
