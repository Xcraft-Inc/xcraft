'use strict';

var reflux     = require ('reflux');

module.exports = function (isWeb) {
  return {
    mixins: [reflux.ListenerMixin],

    eventDependencies: [{
      eventName: 'gadgetList',
      handle: function () {
        this.handleGadgetList.apply (this, arguments);
      }
    }],

    init: function () {
      var self = this;
      var events     = require ('../actions/xcraftEvents.js')(isWeb);

      this.eventDependencies.forEach (function (dep) {
        var action = events[dep.eventName];
        self.listenTo (action, dep.handle);
      });
    },

    handleGadgetList: function (msgData) {
      this.trigger (msgData);
    }
  };
}
