'use strict';

var Reflux     = require ('reflux');

var packagesStore = {
  mixins: [Reflux.ListenerMixin],
  
  activities: [],

  eventDependencies: [{
    eventName: 'pacmanList',
    handle: function () {
      this.handlePackageList.apply (this, arguments);
    }
  }],

  init: function () {
    console.log ('store init');
    var events      = require ('../actions/xcraftEvents.js');
    this.eventDependencies.forEach (function (dep) {
      var action = events[dep.eventName];
      this.listenTo (action, dep.handle);
    });
  },

  handlePackageList: function (msgData) {
    this.trigger (msgData);
  }

};

module.exports = packagesStore;
