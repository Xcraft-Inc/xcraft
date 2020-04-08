'use strict';

var path = require('path');
var clc = require('cli-color');
var shellcraft = require('shellcraft');

var options = {
  prompt: 'Xcraft' + clc.blackBright(' //'),
};

shellcraft.registerExtension(
  path.join(__dirname, '../lib/extensions.js'),
  function () {
    shellcraft.begin(options, function (msg) {
      if (msg) {
        console.log(msg);
      }
    });
  }
);
