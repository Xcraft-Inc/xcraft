'use strict';

var reflux = require ('reflux');

module.exports = {
  mixins: [reflux.ListenerMixin],

  eventDependencies: [{
    eventName: 'widgetTextVerb',
    handle: function () {
      var args = Array.prototype.slice.call (arguments);
      args.unshift ('verb');
      this.handleText.apply (this, args);
    }
  }, {
    eventName: 'widgetTextInfo',
    handle: function () {
      var args = Array.prototype.slice.call (arguments);
      args.unshift ('info');
      this.handleText.apply (this, args);
    }
  }, {
    eventName: 'widgetTextWarn',
    handle: function () {
      var args = Array.prototype.slice.call (arguments);
      args.unshift ('warn');
      this.handleText.apply (this, args);
    }
  }, {
    eventName: 'widgetTextErr',
    handle: function () {
      var args = Array.prototype.slice.call (arguments);
      args.unshift ('err');
      this.handleText.apply (this, args);
    }
  }],

  init: function () {
    var self = this;
    var events = require ('../actions/xcraftEvents.js');

    this.eventDependencies.forEach (function (dep) {
      var action = events[dep.eventName];
      self.listenTo (action, dep.handle);
    });
  },

  handleText: function (mode, msgData) {
    this.trigger (mode, msgData);
  }
};
