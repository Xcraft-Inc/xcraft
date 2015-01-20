'use strict';

var actions = require ('../actions/ttyComponentsActions.js');
var displayLogo = actions.displayLogo;

module.exports = function () {
  displayLogo.listen (function () {
    console.log ();
    console.log (' ____  ___                   _____  __');
    console.log (' \\   \\/  /________________ _/ ____\\/  |_');
    console.log ('  \\     // ___\\_  __ \\__  \\\\   __\\\\   __\\');
    console.log ('  /     \\  \\___|  | \\// __ \\|  |   |  |');
    console.log (' /___/\\  \\___  >__|  (____  /__|   |__|');
    console.log ('       \\_/   \\/           \\/');
    console.log ();
  });
};
