'use strict';

var moduleName = 'gitlabci/runner';

var util         = require ('util');
var EventEmitter = require ('events').EventEmitter;

var client = require ('./client.js') ();
var Build  = require ('./build.js');


function Runner (runnerConfig) {
  if (!(this instanceof Runner)) {
    return new Runner (runnerConfig);
  }

  EventEmitter.call (this);
  // { buildId: projectId }
  this.builds   = {};
  // { buildId: buildData }
  this.queue    = {};
  this.interval = null;
  this.config   = runnerConfig;
  this.log      = require ('xcraft-core-log') (moduleName + '/' + this.config.id);
}

util.inherits (Runner, EventEmitter);

Runner.prototype.start = function () {
  var self = this;

  self.getBuild ();
  self.interval = setInterval (function () {
    self.getBuild ();
  }, self.config.interval || 5000);
};

Runner.prototype.stop = function () {
  if (this.interval) {
    clearInterval (this.interval);
    this.interval = null;
  }
};

Runner.prototype.projectIsRunning = function (id) {
  var self = this;

  return Object.keys (self.builds).some (function (key) {
    var proj = self.builds[key];
    return parseInt (proj) === parseInt (id);
  });
};

Runner.prototype.getBuild = function () {
  var self = this;

  client.getBuild (self.config, function (err, data) {
    if (err) {
      self.log.err ('error getting builds: %s', err);
      return;
    }
    if (!data) {
      return;
    }

    var buildId   = data.id;
    var projectId = data.projectId;

    if (self.projectIsRunning (projectId)) {
      // We are already running a build for this project
      // queue it
      self.queue[buildId] = data;
    } else {
      // Go ahead and start the build
      self.runBuild (data);
    }
  });
};

Runner.prototype.checkQueue = function () {
  var self = this;

  var queue = this.queue;
  var queuedProjects = Object.keys (queue).map (function (build) {
    return queue[build];
  });

  queuedProjects.forEach (function (proj) {
    if (self.projectIsRunning (proj.projectId)) {
      // We are already running a build for this project
      // It is already queued so do nothing
      return;
    }

    self.runBuild (proj);
    delete self.queue[proj.id];
  });
};

Runner.prototype.runBuild = function (data) {
  var self = this;

  self.builds[data.id] = data.projectId;
  self.build = new Build (data, self.config);

  self.build.on ('done', function (err) {
    if (!err) {
      self.log.info ('build success [%s]', self.build.opts.id);
    } else {
      self.log.err ('build failed [%s]: %s', self.build.opts.id, err);
    }

    // cleanup
    delete self.builds[self.build.opts.id];
    delete self.build;
    self.checkQueue ();
  });

  self.build.run ();
};

module.exports = Runner;
