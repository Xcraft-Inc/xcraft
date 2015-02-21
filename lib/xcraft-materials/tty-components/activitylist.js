'use strict';
var reflux        = require ('reflux');
var activityStore = reflux.createStore (require ('../stores/activitystore.js'));


module.exports = function () {
  activityStore.listen (function (activities) {
    console.log ('-Activities-');
    activities.forEach (function (activity) {
      console.log (activity.text);
    });
  });
};
