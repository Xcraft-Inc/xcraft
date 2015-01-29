'use strict';

var Reflux     = require ('reflux');
var events     = require ('../actions/xcraftEvents.js');
var gadgetList = events.gadgetList;

var gadgetStore = Reflux.createStore ({
  mixins: [Reflux.ListenerMixin],

  init: function () {
    this.listenTo (gadgetList, this.handleGadgetList);
  },

  handleGadgetList: function (msgData) {
    this.trigger (msgData);
  }
});

module.exports = gadgetStore;
