'use strict';

const util = require('util');
const EventEmitter = require('events').EventEmitter;

const Build = require('./build.js');

function Runner(runnerConfig, resp) {
  if (!(this instanceof Runner)) {
    return new Runner(runnerConfig, resp);
  }

  EventEmitter.call(this);
  // { buildId: projectId }
  this.builds = {};
  // { buildId: buildData }
  this.queue = {};
  this.interval = null;
  this.config = runnerConfig;
  this.resp = resp;
  this._client = require('./client.js')(resp);
}

util.inherits(Runner, EventEmitter);

Runner.prototype.start = function() {
  const self = this;

  self.getBuild();
  self.interval = setInterval(function() {
    /* Handle only one build at a time. */
    if (!self.config.multi && Object.keys(self.builds).length) {
      return;
    }

    self.getBuild();
  }, self.config.interval || 5000);
};

Runner.prototype.stop = function() {
  if (this.interval) {
    clearInterval(this.interval);
    this.interval = null;
  }
};

Runner.prototype.projectIsRunning = function(id) {
  const self = this;

  return Object.keys(self.builds).some(function(key) {
    const proj = self.builds[key];
    return parseInt(proj) === parseInt(id);
  });
};

Runner.prototype.getBuild = function() {
  const self = this;

  this._client.getBuild(self.config, function(err, data) {
    if (err) {
      self.resp.log.err('error getting builds: %s', err);
      return;
    }
    if (!data) {
      return;
    }

    const buildId = data.id;
    const projectId = data.projectId;

    if (self.projectIsRunning(projectId)) {
      // We are already running a build for this project
      // queue it
      self.queue[buildId] = data;
    } else {
      // Go ahead and start the build
      self.runBuild(data);
    }
  });
};

Runner.prototype.checkQueue = function() {
  const self = this;

  const queue = this.queue;
  const queuedProjects = Object.keys(queue).map(function(build) {
    return queue[build];
  });

  queuedProjects.forEach(function(proj) {
    if (self.projectIsRunning(proj.projectId)) {
      // We are already running a build for this project
      // It is already queued so do nothing
      return;
    }

    self.runBuild(proj);
    delete self.queue[proj.id];
  });
};

Runner.prototype.runBuild = function(data) {
  const self = this;

  self.builds[data.id] = data.projectId;
  self.build = new Build(data, self.config, self.resp);

  self.build.on('done', function(err) {
    if (!err) {
      self.resp.log.info('build success [%s]', self.build.opts.id);
    } else {
      self.resp.log.err('build failed [%s]: %s', self.build.opts.id, err);
    }

    // cleanup
    delete self.builds[self.build.opts.id];
    delete self.build;
    self.checkQueue();
  });

  self.build.run();
};

module.exports = Runner;
