'use strict';

var path       = require ('path');
var shellcraft = require ('shellcraft');

var options = {
  prompt: 'Xcraft>'
};

shellcraft.registerExtension (path.join (__dirname, '../lib/extensions.js'), function () {
  shellcraft.begin (options, function (msg) {
    if (msg) {
      console.log (msg);
    }
  });
});
