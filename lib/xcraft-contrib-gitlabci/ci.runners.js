'use strict';

const path = require ('path');
const fs   = require ('fs');

const xFs     = require ('xcraft-core-fs');
const xWizard = require ('xcraft-core-wizard');


const runners = {};
const cmd     = {};


const getRunnerConfig = function (runnerId, response, callback) {
  const xConf  = require ('xcraft-core-etc') (null, response).load ('xcraft');
  const config = require ('xcraft-core-etc') (null, response).load ('xcraft-contrib-gitlabci');

  const runnerDir = path.join (xConf.xcraftRoot, config.configDir, runnerId);
  const fileName  = path.join (runnerDir, 'runner-config.json');

  fs.readFile (fileName, 'utf8', function (err, data) {
    if (err) {
      return callback && callback ('Bad runner id');
    }
    return callback && callback (null, JSON.parse (data));
  });
};

cmd.start = function (msg, response) {
  const runnerId = msg.data.id;

  if (runners[runnerId]) {
    runners[runnerId].start ();
    response.events.send ('ci.runners.start.finished');
    response.log.info ('Runner %s started!', runnerId);
    return;
  }

  getRunnerConfig (runnerId, response, function (err, runnerConfig) {
    if (err) {
      response.log.err (err);
      response.events.send ('ci.runners.start.finished');
      return;
    }

    const ciRunner = require ('./lib/runner.js') (runnerConfig, response);
    runners[runnerId] = ciRunner;
    runners[runnerId].start ();

    response.events.send ('ci.runners.start.finished');
    response.log.info ('Runner %s started!', runnerId);
  });
};

cmd.stop = function (msg, response) {
  const runnerId = msg.data.id;

  if (runners[runnerId]) {
    runners[runnerId].stop ();
    delete runners[runnerId];
    response.log.info ('Runner %s stopped!', runnerId);
  } else {
    response.log.warn ('No runner started with this id or bad id');
  }

  response.events.send ('ci.runners.stop.finished');
};

cmd.restart = function (msg, response) {
  const runnerId = msg.data.id;

  if (runners[runnerId]) {
    runners[runnerId].stop ();
    runners[runnerId].start ();
    response.log.info ('Runner %s restarted!', runnerId);
  } else {
    response.log.warn ('No runner started with this id or bad id');
  }

  response.events.send ('ci.runners.restart.finished');
};

cmd.create = function (msg, response) {
  msg.data.wizardImpl    = xWizard.stringify (path.join (__dirname, './wizard.js'));
  msg.data.wizardAnswers = [];

  response.command.send ('ci.runners.create.prepare', msg.data);
};

cmd['create.prepare'] = function (msg, response) {
  const wizard = {
    token: msg.data.token
  };

  msg.data.wizardName     = 'runner';
  msg.data.wizardDefaults = wizard;

  msg.data.nextCommand = 'ci.runners.create.runner';
  response.events.send ('ci.runners.create.added', msg.data);
  response.events.send ('ci.runners.create.prepare.finished');
};

cmd['create.runner'] = function (msg, response) {
  const xConf  = require ('xcraft-core-etc') (null, response).load ('xcraft');
  const config = require ('xcraft-core-etc') (null, response).load ('xcraft-contrib-gitlabci');

  const server = {};
  const xcraft = {};

  let timeout  = 3600;
  let interval = 5000;
  let updateInterval = 3000;
  let multi = false;
  let logWidth = 120;

  msg.data.wizardAnswers.forEach (function (it) {
    if (it.hasOwnProperty ('token')) {
      server.token         = it.token;
      timeout              = parseInt (it.timeout);
      interval             = parseInt (it.interval);
      updateInterval       = parseInt (it.updateInterval);
      multi                = !!it.multi;
      logWidth             = parseInt (it.logWidth);
      xcraft.host          = it.host;
      xcraft.commanderPort = parseInt (it.commanderPort);
      xcraft.notifierPort  = parseInt (it.notifierPort);
      xcraft.platform      = [it.platform];
    }
  });

  const ciClient = require ('./lib/client.js') (response);

  ciClient.registerRunner (server.token, xcraft.platform, function (err, runner) {
    if (err) {
      response.log.err ('Error during runner registration:', err);
      response.events.send ('ci.runners.create.runner.finished');
      response.events.send ('ci.runners.create.finished');
      return;
    }

    const runnerDir = path.join (xConf.xcraftRoot, config.configDir, runner.id.toString ());
    const fileName  = path.join (runnerDir, 'runner-config.json');

    try {
      xFs.mkdir (runnerDir);
    } catch (err) {
      response.log.err ('Error during runner repo. creation:', err);
      response.events.send ('ci.runners.create.runner.finished');
      response.events.send ('ci.runners.create.finished');
      return;
    }

    runner.root           = runnerDir;      /* add runnerDir in config   */
    runner.timeout        = timeout;        /* add build timeout         */
    runner.interval       = interval;       /* add polling interval      */
    runner.updateInterval = updateInterval; /* add update interval       */
    runner.multi          = multi;          /* multiple builds at a time */
    runner.logWidth       = logWidth;       /* output log width on CI    */
    runner.xcraft         = xcraft;         /* add Xcraft server access  */

    fs.writeFileSync (fileName, JSON.stringify (runner, null, '  '));

    response.log.info ('Runner %s created!', runner.id);
    response.events.send ('ci.runners.create.runner.finished');
    response.events.send ('ci.runners.create.finished');
  });
};

cmd.delete = function (msg, response) {
  const xConf  = require ('xcraft-core-etc') (null, response).load ('xcraft');
  const config = require ('xcraft-core-etc') (null, response).load ('xcraft-contrib-gitlabci');

  const runnerId  = msg.data.id;

  getRunnerConfig (runnerId, response, function (err, runnerConfig) {
    if (err) {
      response.log.err (err);
      response.events.send ('ci.runners.delete.finished');
      return;
    }

    const ciClient = require ('./lib/client.js') (response);

    ciClient.deleteRunner (runnerConfig, function () {
      const runnerDir = path.join (xConf.xcraftRoot,
                                 config.configDir,
                                 runnerId.toString ());
      xFs.rm (runnerDir);

      response.log.info ('Runner %s deleted', runnerId);
      response.events.send ('ci.runners.delete.finished');
    });
  });
};

cmd.list = function (msg, response) {
  const xConf  = require ('xcraft-core-etc') (null, response).load ('xcraft');
  const config = require ('xcraft-core-etc') (null, response).load ('xcraft-contrib-gitlabci');

  const runnersDir = path.join (xConf.xcraftRoot, config.configDir);

  fs.stat (runnersDir, function (err) {
    if (err) {
      response.log.info ('No runners found, use ci.runners.create <token>');
      return;
    }

    const runners = xFs.ls (runnersDir, /^[0-9]+$/);
    runners.forEach (function (runnerId) {
      getRunnerConfig (runnerId, response, function (err, config) {
        /* TODO: Implement result widget */
        response.log.info ('Runner #%s <%s>', config.id, config.token);
      });
    });
  });

  response.events.send ('ci.runners.list.finished');
};

/**
 * Retrieve the list of available commands.
 *
 * @returns {Object} The list and definitions of commands.
 */
exports.xcraftCommands = function () {
  const xUtils = require ('xcraft-core-utils');
  return {
    handlers: cmd,
    rc: xUtils.json.fromFile (path.join (__dirname, './rc.json'))
  };
};
