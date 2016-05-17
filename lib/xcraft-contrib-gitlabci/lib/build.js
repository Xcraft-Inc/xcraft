'use strict';

const async        = require ('async');
const path         = require ('path');
const util         = require ('util');
const EventEmitter = require ('events').EventEmitter;

const Tasks  = require ('./build-tasks.js');
const log    = require ('xcraft-core-utils').log;


function Build (opts, runnerConfig, response) {
  if (!(this instanceof Build)) {
    return new Build (opts, runnerConfig, response);
  }

  EventEmitter.call (this);
  this.config   = runnerConfig;
  this.buildDir = this.config.root;
  opts.commands = opts.commands || [];
  opts.timeout  = +(this.config.timeout || opts.timeout || 5000) * 1000;
  this.opts     = opts;
  this.output   = '';
  this.dirty    = false;
  this.retry    = 0;
  this.retryMax = 10;
  this.projectDir = path.join (this.buildDir, 'project-' + opts.projectId);
  this.state = 'waiting';
  this.response = response;
  this._client  = require ('./client.js') (response);
}

util.inherits (Build, EventEmitter);

Build.prototype.run = function () {
  const self = this;

  this.state = 'running';

  const cmds = this.opts.commands;
  const dir  = this.projectDir;

  self.runCommand (cmds, dir, function (err) {
    self.state = err ? 'failed' : 'success';
    self.update (function (_err) {
      if (_err) {
        self.response.log.warn (_err);
      }

      self.emit ('done', err);
    });
  });
};

Build.prototype.append = function (str) {
  this.output += str;
  this.dirty = true;
};

/* Update the build on GitLab CI.
 *
 * If the status code is not right (like 200), the runner retries at least
 * this.retryMax times. It is aborted immediatly only when a low level error
 * occures.
 */
Build.prototype._tryToUpdate = function (callback) {
  const self = this;

  if (self.retry === self.retryMax) {
    callback ('aborting...');
    return;
  }

  self.update (function (err, updated) {
    if (self.retry === self.retryMax) {
      callback ('aborting...');
      return;
    }

    if (!updated) {
      self.retry++;
    } else {
      self.retry = 0;
    }

    if (self.retry) {
      self.response.log.warn ('retried to contact CI %d/%d', self.retry, self.retryMax);
    }

    if (self.retry === self.retryMax) {
      err = util.format ('%s%s',
                         err ? err + '\n' : '',
                         'the runner has retried to contact CI ' + self.retry + ' times');
      if (callback) {
        callback (err);
      }
      return;
    } else if (err) {
      self.response.log.warn (err);
    }

    self.dirty = !updated;
    if (callback) {
      callback ();
    }
  });
};

Build.prototype._updater = function (tasks) {
  if (!this.dirty || tasks.getAbort ()) {
    return;
  }

  this._tryToUpdate (function (err) {
    if (err && !tasks.getAbort ()) {
      tasks.setAbort (true, err);
    }
  });
};

Build.prototype.runCommand = function (cmd, dir, callback) {
  const self = this;

  const packages    = cmd[0] || '';
  const mainPackage = packages.split (',')[0].replace (/:.*/, '');

  const logWidth = self.config.logWidth || 110;

  /* TODO: add timeout support. */

  const xBusClient = require ('xcraft-core-busclient');
  let xcraftPortal = new xBusClient.BusClient (self.config.xcraft);

  xcraftPortal.connect (null, function () {
    const resp = xcraftPortal.newResponse (cmd, xcraftPortal.getOrcName ());
    const tasks = new Tasks (resp, mainPackage, packages, self.opts.sha);
    const timer = setInterval (self._updater.bind (self), self.config.updateInterval || 3000, tasks);

    let prevPercent = -1;

    ['verb', 'info', 'warn', 'err'].forEach (function (level) {
      resp.events.subscribe (`widget.text.${level}`, function (msg) {
        if (/^gitlabci(|\/.*)$/.test (msg.data.mod)) {
          return;
        }

        const text = log.decorate (level, 'CI', msg.data.mod, msg.data.text, logWidth);
        self.append (text + '\n');
      });
    });

    resp.events.subscribe ('widget.progress', function (msg) {
      const ratio   = msg.data.position / msg.data.length;
      const percent = parseInt (100 * ratio);
      if ((percent % 2) !== 0) {
        return;
      }

      if (percent === prevPercent) {
        return;
      }

      prevPercent = percent;

      const progress = util.format ('%s |%s> %d\%',
                                  msg.data.topic,
                                  new Array (percent / 2).join ('='),
                                  percent);
      const text = log.decorate ('info', 'CI', msg.data.mod, progress, logWidth);

      self.append (text + '\n');
    });

    self.response.log.info ('runner connected with ' + xcraftPortal.getOrcName ());

    async.auto ({
      make:        tasks.make.bind (tasks),
      isInstalled: ['make',        tasks.isInstalled.bind (tasks)],
      remove:      ['isInstalled', tasks.remove.bind (tasks)],
      build:       ['remove',      tasks.build.bind (tasks)],
      disconnect:  ['build',       tasks.disconnect.bind (tasks)]
    }, function (err, results) {
      clearInterval (timer);

      xcraftPortal.stop ((err) => {
        if (results.make  !== resp.events.status.succeeded ||
            results.build !== resp.events.status.succeeded) {
          if (!err) {
            err = '';
          }

          err += util.format ('\nmake status: %d\nbuild status: %d',
                              results.make, results.build);
        }

        if (tasks.getAbort ()) {
          err = util.format ('%s%s',
          err ? err + '\n' : '',
          tasks.getAbortError ());
          callback (err);
          return;
        }

        self._tryToUpdate (function (_err) {
          if (err && _err) {
            err += '\n' + _err;
          }
          callback (err || _err);
        });
      });

      xcraftPortal = null;
    });
  });
};

Build.prototype.update = function (callback) {
  const id = this.opts.id;
  this._client.updateBuild (this.config, id, this.state, this.output, callback);
};

module.exports = Build;
