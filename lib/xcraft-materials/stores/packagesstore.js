'use strict';

var Reflux            = require ('reflux');
var events            = require ('../actions/xcraftEvents.js');
var packageList       = events.pacmanList;

var packagesStore     = Reflux.createStore({

  activities: [],

  init: function () {
    this.listenTo(packageList, this.handlePackageList);
  },

  handlePackageList: function (msgData) {
    this.trigger(msgData);
  }

});

module.exports = packagesStore;
