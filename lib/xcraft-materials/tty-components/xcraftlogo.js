'use strict';

var actions = require ('../actions/ttyComponentsActions.js');
var displayLogo = actions.displayLogo;

module.exports = function () {
  var clc    = require ('cli-color');
  var figlet = require ('figlet');

  displayLogo.listen (function () {
    figlet ('Xcraft', {
      font: 'graffiti',
      horizontalLayout: 'default',
      verticalLayout: 'default'
    }, function (err, data) {
      console.log ('');
      console.log (data .replace (/[_\/\\]/g, function (match) {
        switch (match) {
        case '_': {
          return clc.green (match);
        }
        case '/': {
          return clc.greenBright (match);
        }
        case '\\': {
          return clc.blackBright (match);
        }
        case '|': {
          return clc.white (match);
        }
        }
      }));
      console.log ('');
    });
  });
};
