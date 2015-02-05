'use strict';
var Reflux     = require ('reflux');
var activityStore = Reflux.createStore(require ('../stores/activitystore.js')());


module.exports = function () {
  activityStore.listen (function (activities) {
    console.log ('-Activities-');
    activities.forEach (function (activity) {
      console.log (activity.text);
    });
  });
};
