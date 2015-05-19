'use strict';

var actions = require ('../actions/ttyComponentsActions.js');
var display = actions.displayGameOver;

module.exports = function () {
  var clc = require ('cli-color');

  display.listen (function () {
    console.log ();
    console.log ('             ' +
                 clc.blackBright ('.') +
                 clc.white (':') +
                 clc.green ('G') +
                 clc.greenBright ('ame') +
                 clc.green ('O') +
                 clc.greenBright ('ver') +
                 clc.white (':') +
                 clc.blackBright ('.'));
    console.log ();
  });
};
