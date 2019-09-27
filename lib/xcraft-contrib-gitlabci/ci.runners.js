'use strict';

const path = require('path');
const fs = require('fs');

const xFs = require('xcraft-core-fs');
const xWizard = require('xcraft-core-wizard');

const runners = {};
const cmd = {};

const getRunnerConfig = function(runnerId, resp, callback) {
  const xConf = require('xcraft-core-etc')(null, resp).load('xcraft');
  const config = require('xcraft-core-etc')(null, resp).load(
    'xcraft-contrib-gitlabci'
  );

  const runnerDir = path.join(xConf.xcraftRoot, config.configDir, runnerId);
  const fileName = path.join(runnerDir, 'runner-config.json');

  fs.readFile(fileName, 'utf8', function(err, data) {
    if (err) {
      return callback && callback('Bad runner id');
    }
    return callback && callback(null, JSON.parse(data));
  });
};

cmd.start = function(msg, resp) {
  const runnerId = msg.data.id;

  if (runners[runnerId]) {
    runners[runnerId].start();
    resp.events.send(`ci.runners.start.${msg.id}.finished`);
    resp.log.info('Runner %s started!', runnerId);
    return;
  }

  getRunnerConfig(runnerId, resp, function(err, runnerConfig) {
    if (err) {
      resp.log.err(err);
      resp.events.send(`ci.runners.start.${msg.id}.finished`);
      return;
    }

    const ciRunner = require('./lib/runner.js')(runnerConfig, resp);
    runners[runnerId] = ciRunner;
    runners[runnerId].start();

    resp.events.send(`ci.runners.start.${msg.id}.finished`);
    resp.log.info('Runner %s started!', runnerId);
  });
};

cmd.stop = function(msg, resp) {
  const runnerId = msg.data.id;

  if (runners[runnerId]) {
    runners[runnerId].stop();
    delete runners[runnerId];
    resp.log.info('Runner %s stopped!', runnerId);
  } else {
    resp.log.warn('No runner started with this id or bad id');
  }

  resp.events.send(`ci.runners.stop.${msg.id}.finished`);
};

cmd.restart = function(msg, resp) {
  const runnerId = msg.data.id;

  if (runners[runnerId]) {
    runners[runnerId].stop();
    runners[runnerId].start();
    resp.log.info('Runner %s restarted!', runnerId);
  } else {
    resp.log.warn('No runner started with this id or bad id');
  }

  resp.events.send(`ci.runners.restart.${msg.id}.finished`);
};

cmd.create = function(msg, resp) {
  msg.data.wizardImpl = xWizard.stringify(path.join(__dirname, './wizard.js'));
  msg.data.wizardAnswers = [];

  resp.command.send('ci.runners.create.prepare', msg.data);
};

cmd['create.prepare'] = function(msg, resp) {
  const wizard = {
    token: msg.data.token,
  };

  msg.data.wizardName = 'runner';
  msg.data.wizardDefaults = wizard;

  msg.data.nextCommand = 'ci.runners.create.runner';
  resp.events.send('ci.runners.create.added', msg.data);
  resp.events.send(`ci.runners.create.prepare.${msg.id}.finished`);
};

cmd['create.runner'] = function(msg, resp) {
  const xConf = require('xcraft-core-etc')(null, resp).load('xcraft');
  const config = require('xcraft-core-etc')(null, resp).load(
    'xcraft-contrib-gitlabci'
  );

  const server = {};
  const xcraft = {};

  let timeout = 3600;
  let interval = 5000;
  let updateInterval = 3000;
  let multi = false;
  let logWidth = 120;

  msg.data.wizardAnswers.forEach(function(it) {
    if (it.hasOwnProperty('token')) {
      server.token = it.token;
      timeout = parseInt(it.timeout);
      interval = parseInt(it.interval);
      updateInterval = parseInt(it.updateInterval);
      multi = !!it.multi;
      logWidth = parseInt(it.logWidth);
      xcraft.host = it.host;
      xcraft.commanderPort = parseInt(it.commanderPort);
      xcraft.notifierPort = parseInt(it.notifierPort);
      xcraft.platform = [it.platform];
    }
  });

  const ciClient = require('./lib/client.js')(resp);

  ciClient.registerRunner(server.token, xcraft.platform, function(err, runner) {
    if (err) {
      resp.log.err('Error during runner registration:', err);
      resp.events.send(`ci.runners.create.runner.${msg.id}.finished`);
      resp.events.send(`ci.runners.create.${msg.id}.finished`);
      return;
    }

    const runnerDir = path.join(
      xConf.xcraftRoot,
      config.configDir,
      runner.id.toString()
    );
    const fileName = path.join(runnerDir, 'runner-config.json');

    try {
      xFs.mkdir(runnerDir);
    } catch (err) {
      resp.log.err('Error during runner repo. creation:', err);
      resp.events.send(`ci.runners.create.runner.${msg.id}.finished`);
      resp.events.send(`ci.runners.create.${msg.id}.finished`);
      return;
    }

    runner.root = runnerDir; /* add runnerDir in config */
    runner.timeout = timeout; /* add build timeout */
    runner.interval = interval; /* add polling interval */
    runner.updateInterval = updateInterval; /* add update interval */
    runner.multi = multi; /* multiple builds at a time */
    runner.logWidth = logWidth; /* output log width on CI */
    runner.xcraft = xcraft; /* add Xcraft server access */

    fs.writeFileSync(fileName, JSON.stringify(runner, null, '  '));

    resp.log.info('Runner %s created!', runner.id);
    resp.events.send(`ci.runners.create.runner.${msg.id}.finished`);
    resp.events.send(`ci.runners.create.${msg.id}.finished`);
  });
};

cmd.delete = function(msg, resp) {
  const xConf = require('xcraft-core-etc')(null, resp).load('xcraft');
  const config = require('xcraft-core-etc')(null, resp).load(
    'xcraft-contrib-gitlabci'
  );

  const runnerId = msg.data.id;

  getRunnerConfig(runnerId, resp, function(err, runnerConfig) {
    if (err) {
      resp.log.err(err);
      resp.events.send(`ci.runners.delete.${msg.id}.finished`);
      return;
    }

    const ciClient = require('./lib/client.js')(resp);

    ciClient.deleteRunner(runnerConfig, function() {
      const runnerDir = path.join(
        xConf.xcraftRoot,
        config.configDir,
        runnerId.toString()
      );
      xFs.rm(runnerDir);

      resp.log.info('Runner %s deleted', runnerId);
      resp.events.send(`ci.runners.delete.${msg.id}.finished`);
    });
  });
};

cmd.list = function(msg, resp) {
  const xConf = require('xcraft-core-etc')(null, resp).load('xcraft');
  const config = require('xcraft-core-etc')(null, resp).load(
    'xcraft-contrib-gitlabci'
  );

  const runnersDir = path.join(xConf.xcraftRoot, config.configDir);

  fs.stat(runnersDir, function(err) {
    if (err) {
      resp.log.info('No runners found, use ci.runners.create <token>');
      return;
    }

    const runners = xFs.ls(runnersDir, /^[0-9]+$/);
    runners.forEach(function(runnerId) {
      getRunnerConfig(runnerId, resp, function(err, config) {
        /* TODO: Implement result widget */
        resp.log.info('Runner #%s <%s>', config.id, config.token);
      });
    });
  });

  resp.events.send(`ci.runners.list.${msg.id}.finished`);
};

/**
 * Retrieve the list of available commands.
 *
 * @returns {Object} The list and definitions of commands.
 */
exports.xcraftCommands = function() {
  return {
    handlers: cmd,
    rc: {
      list: {
        desc: 'display available runners',
      },
      start: {
        desc: 'start a gitlab-ci runner',
        options: {
          params: {
            required: 'id',
          },
        },
      },
      stop: {
        desc: 'stop a gitlab-ci runner',
        options: {
          params: {
            required: 'id',
          },
        },
      },
      create: {
        desc: 'create and register a new gitlab runner',
        options: {
          wizard: true,
          params: {
            optional: 'token',
          },
        },
      },
      'create.prepare': {
        parallel: true,
      },
      'create.runner': {
        parallel: true,
      },
      delete: {
        desc: 'delete and unregister a gitlab runner',
        options: {
          params: {
            required: 'id',
          },
        },
      },
    },
  };
};
