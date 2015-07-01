'use strict';

var moduleName = 'gitlabci/runners';

var path         = require ('path');
var xFs          = require ('xcraft-core-fs');
var fs           = require ('fs');
var xLog         = require ('xcraft-core-log') (moduleName);
var xConf        = require ('xcraft-core-etc').load ('xcraft');
var config       = require ('xcraft-core-etc').load ('xcraft-contrib-gitlabci');
var busClient    = require ('xcraft-core-busclient').getGlobal ();
var ciClient     = require ('./lib/client.js') ();

var runners = {};
var cmd     = {};


var getRunnerConfig = function (runnerId, callback) {
  var runnerDir = path.join (xConf.xcraftRoot, config.configDir, runnerId);
  var fileName  = path.join (runnerDir, 'runner-config.json');

  fs.readFile (fileName, 'utf8', function (err, data) {
    if (err) {
      return callback && callback ('Bad runner id');
    }
    return callback && callback (null, JSON.parse (data));
  });
};

cmd.start = function (msg) {
  var runnerId = msg.data.id;

  if (runners[runnerId]) {
    runners[runnerId].start ();
    busClient.events.send ('ci.runners.start.finished');
    xLog.info ('Runner %s started!', runnerId);
    return;
  }

  getRunnerConfig (runnerId, function (err, runnerConfig) {
    if (err) {
      xLog.err (err);
      busClient.events.send ('ci.runners.start.finished');
      return;
    }

    var ciRunner = require ('./lib/runner.js') (runnerConfig);
    runners[runnerId] = ciRunner;
    runners[runnerId].start ();

    busClient.events.send ('ci.runners.start.finished');
    xLog.info ('Runner %s started!', runnerId);
  });
};

cmd.stop = function (msg) {
  var runnerId = msg.data.id;

  if (runners[runnerId]) {
    runners[runnerId].stop ();
    delete runners[runnerId];
    xLog.info ('Runner %s stopped!', runnerId);
  } else {
    xLog.warn ('No runner started with this id or bad id');
  }

  busClient.events.send ('ci.runners.stop.finished');
};

cmd.restart = function (msg) {
  var runnerId = msg.data.id;

  if (runners[runnerId]) {
    runners[runnerId].stop ();
    runners[runnerId].start ();
    xLog.info ('Runner %s restarted!', runnerId);
  } else {
    xLog.warn ('No runner started with this id or bad id');
  }

  busClient.events.send ('ci.runners.restart.finished');
};

cmd.create = function (msg) {
  msg.data.wizardAnswers = [];
  busClient.command.send ('ci.runners.create.prepare', msg.data);
};

cmd['create.prepare'] = function (msg) {
  var wizard = {
    token: msg.data.token
  };

  msg.data.wizardPath     = path.join (__dirname, 'wizard.js');
  msg.data.wizardName     = 'runner';
  msg.data.wizardDefaults = wizard;

  msg.data.nextCommand = 'ci.runners.create.runner';
  busClient.events.send ('ci.runners.create.added', msg.data);
};

cmd['create.runner'] = function (msg) {
  var server = {};
  var xcraft = {};

  var timeout  = 3600;
  var interval = 5000;

  msg.data.wizardAnswers.forEach (function (it) {
    if (it.hasOwnProperty ('token')) {
      server.token         = it.token;
      timeout              = parseInt (it.timeout);
      interval             = parseInt (it.interval);
      xcraft.host          = it.host;
      xcraft.commanderPort = parseInt (it.commanderPort);
      xcraft.notifierPort  = parseInt (it.notifierPort);
    }
  });

  ciClient.registerRunner (server.token, function (err, runner) {
    if (err) {
      xLog.err ('Error during runner registration:', err);
      busClient.events.send ('ci.runners.create.finished');
      return;
    }

    var runnerDir = path.join (xConf.xcraftRoot, config.configDir, runner.id.toString ());
    var fileName  = path.join (runnerDir, 'runner-config.json');

    try {
      xFs.mkdir (runnerDir);
    } catch (err) {
      xLog.err ('Error during runner repo. creation:', err);
      busClient.events.send ('ci.runners.create.finished');
    }

    runner.root     = runnerDir; /* add runnerDir in config  */
    runner.timeout  = timeout;   /* add build timeout        */
    runner.interval = interval;  /* add polling interval     */
    runner.xcraft   = xcraft;    /* add Xcraft server access */

    fs.writeFileSync (fileName, JSON.stringify (runner, null, '  '));

    xLog.info ('Runner %s created!', runner.id);
    busClient.events.send ('ci.runners.create.finished');
  });
};

cmd.delete = function (msg) {
  var runnerId  = msg.data.id;

  getRunnerConfig (runnerId, function (err, runnerConfig) {
    if (err) {
      xLog.err (err);
      busClient.events.send ('ci.runners.delete.finished');
      return;
    }

    ciClient.deleteRunner (runnerConfig, function (err, runner) {
      var runnerDir = path.join (xConf.xcraftRoot,
                                 config.configDir,
                                 runner.id.toString ());
      xFs.rm (runnerDir);

      xLog.info ('Runner %s deleted', runner.id);
      busClient.events.send ('ci.runners.delete.finished');
    });
  });
};

cmd.list = function () {
  var runnersDir = path.join (xConf.xcraftRoot, config.configDir);

  fs.stat (runnersDir, function (err) {
    if (err) {
      xLog.info ('No runners found, use ci.runners.create <token>');
      return;
    }

    var runners = xFs.ls (runnersDir, /^[0-9]+$/);
    runners.forEach (function (runnerId) {
      getRunnerConfig (runnerId, function (err, config) {
        /* TODO: Implement result widget */
        xLog.info ('Runner #%s <%s>', config.id, config.token);
      });
    });
  });

  busClient.events.send ('ci.runners.list.finished');
};

/**
 * Retrieve the list of available commands.
 *
 * @returns {Object} The list and definitions of commands.
 */
exports.xcraftCommands = function () {
  return {
    handlers: cmd,
    rc: path.join (__dirname, './rc.json')
  };
};

/**
 * Retrieve the inquirer definition for xcraft-core-etc
 */
exports.xcraftConfig = [{
  type: 'input',
  name: 'url',
  message: 'GitLab CI url',
  default: 'https://ci.epsitec.ch'
}, {
  type: 'confirm',
  name: 'strictSSL',
  message: 'Use strict SSL?',
  default: true
}, {
  type: 'input',
  name: 'configDir',
  message: 'Runners repository:',
  default: './var/xcraft-contrib-gitlabci/'
}];
