'use strict';

var moduleName = 'config';

var path       = require ('path');
var confWizard = require ('./config/confWizard.js');
var zogLog     = require ('xcraft-core-log') (moduleName);

process.chdir (path.join (__dirname, '/..'));

module.exports = function () {
  var yaml     = require ('js-yaml');
  var fs       = require ('fs');
  var inquirer = require ('inquirer');

  var zogPlatform = require ('xcraft-core-platform');

  var userYaml    = './zog.yaml';
  var defaultYaml = './scripts/zog.yaml';

  var data = '';
  var dataOrig = fs.readFileSync (defaultYaml, 'utf8');

  try {
    /* Try with the user config file if possible. */
    data = fs.readFileSync (userYaml, 'utf8');
  } catch (err) {
    /* Else, we use the default config file. */
    data = dataOrig;
  }

  var conf = yaml.safeLoad (data);
  var confOrig = yaml.safeLoad (dataOrig);

  var runWizard = function (wizName, callbackDone) {
    var alwaysSave = false;

    if (!conf.hasOwnProperty (wizName)) {
      conf[wizName] = {};
      alwaysSave = true;
    }

    confWizard[wizName].forEach (function (item) {
      if (!conf[wizName].hasOwnProperty (item.name)) {
        conf[wizName][item.name] = confOrig[wizName][item.name];
      }

      item.default = conf[wizName][item.name];
    });

    inquirer.prompt (confWizard[wizName], function (answers) {
      var hasChanged = false;

      zogLog.verb ('JSON output:\n' + JSON.stringify (answers, null, '  '));

      Object.keys (answers).forEach (function (item) {
        if (conf[wizName][item] !== answers[item]) {
          conf[wizName][item] = answers[item];
          hasChanged = true;
        }
      });

      if (alwaysSave || hasChanged) {
        data = yaml.safeDump (conf);
        fs.writeFileSync (userYaml, data);
      }

      if (callbackDone) {
        callbackDone ();
      }
    });
  };

  return {
    configure: function () {
      var async = require ('async');

      var wizards = [];
      Object.keys (confOrig).forEach (function (item) {
        wizards.push (item);
      });

      async.eachSeries (wizards, function (wiz, callback) {
        zogLog.info ('configure zog (%s)', wiz);
        runWizard (wiz, callback);
      });
    },

    /* Lib helpers. */
    libPkgCreate     : path.resolve ('./node_modules/xcraft-contrib-pacman/pkgCreate.js'),
    libPkgDefinition : path.resolve ('./node_modules/xcraft-contrib-pacman/pkgDefinition.js'),
    libPkgList       : path.resolve ('./node_modules/xcraft-contrib-pacman/pkgList.js'),
    libPkgWizard     : path.resolve ('./node_modules/xcraft-contrib-pacman/wizard.js'),
    libPkgControl    : path.resolve ('./node_modules/xcraft-contrib-pacman/pkgControl.js'),
    libPkgChangelog  : path.resolve ('./node_modules/xcraft-contrib-pacman/pkgChangelog.js'),
    libPkgMake       : path.resolve ('./node_modules/xcraft-contrib-pacman/pkgMake.js'),
    libPkgCmd        : path.resolve ('./node_modules/xcraft-contrib-pacman/pkgCmd.js')
  };
};
